(function () {

    const TIMEOUT_MS = 400;
    const CHORD_REGEX = /\[[A-G]m*(sus)*(maj)*4*#*7*\]/g;
    const BRACKETS = /\[|\]/g;
    const getFiddle = firebase.functions().httpsCallable('getFiddle');
    const createFiddle = firebase.functions().httpsCallable('createFiddle');
    const updateFiddle = firebase.functions().httpsCallable('updateFiddle');

    let splitPanels = null;
    let $scope;

    /**
     * @param {string} line 
     */
    function matchExpressions(line) {

        let result = `<div class="line">${line}</div>`;
        let matches = line.match(CHORD_REGEX);

        if (matches != null) {
            for (const match of matches) {
                const chord = match.replace(BRACKETS, '');
                let chordHtml = `<span class="chord" data-chord="${chord}">&nbsp;</span>`;
                result = result.replace(match, chordHtml);
            }
        }

        return result;
    }

    function parse(rawLines) {
        let output = '';

        for (const line of rawLines) {
            output += matchExpressions(line.trim());
            output += '<br>';
        }

        return output;
    }

    function transformInput(text) {
        let lines = text.split('\n');
        let content = parse(lines);

        $scope.outputBox.html(content);
    }

    function hasParentClass(element, className) {
        if (element.classList && element.classList.contains(className))
            return true;
        else
            return element.parentNode != null && hasParentClass(element.parentNode, className);
    }

    function showLoading(isLoading) {
        $scope.loadingSpinner.toggleClass('hide', !isLoading);
        $scope.editorWrapper.toggleClass('hide', isLoading);

        if (splitPanels !== null) {
            splitPanels.destroy();
        }

        splitPanels = Split(['#metadata', '#song', '#preview'], {
            elementStyle: (dimension, size, gutterSize) => ({
                'flex-basis': `calc(${size}% - ${gutterSize}px)`,
            }),
            gutterStyle: (dimension, gutterSize) => ({
                'flex-basis': `${gutterSize}px`,
            }),
            gutterSize: 10,
            minSize: 0,
            cursor: 'ew-resize'
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        $scope = Bind.createScope();
        $scope.inputBox.onInput = onTextInput;
        $scope.inputBox.onChange = onTextInput;
        $scope.tempo.onChange = () => { modifyTempo(0); };

        const fiddleId = getFiddleId();
        if (fiddleId) {
            showLoading(true);
            getFiddle({ id: fiddleId })
                .then((result) => {
                    loadFiddle(result);
                    showLoading(false);
                    // TODO: resize panels to show preview only
                })
                .catch(loadError);
        } else {
            showLoading(false);
        }

        function getFiddleId() {
            const searchParams = window.location.search;
            if (searchParams)
                return searchParams.replace('?f=', '');
            return null;
        }

        function loadFiddle({ data }) {
            const { id, fiddle } = data;
            if (id && fiddle) {
                // change window url
                window.history.pushState('', '', `?f=${id}`);

                // load contents
                $scope.inputBox.value = fiddle.song;
                $scope.title.value = fiddle.title;
                $scope.artist.value = fiddle.artist;
                $scope.description.value = fiddle.description;
                $scope.tuning.value = fiddle.tuning;
                $scope.capo.value = fiddle.capo;
                $scope.tempo.value = fiddle.tempo;

                $scope.saveButton.text('Update');
            }
        }

        window.saveFiddle = function saveFiddle() {
            // TODO: validate empty fields

            const id = getFiddleId();
            const fiddle = {
                song: $scope.inputBox.value,
                title: $scope.title.value,
                artist: $scope.artist.value,
                description: $scope.description.value,
                tuning: $scope.tuning.value,
                capo: $scope.capo.value,
                tempo: $scope.tempo.value
            };

            if (id) {
                updateFiddle({ id, fiddle })
                    .then(loadFiddle)
                    .catch(loadError);
            } else {
                createFiddle(fiddle)
                    .then(loadFiddle)
                    .catch(loadError);
            }
        };

        window.newFiddle = function newFiddle() {
            reset();
        };

        function loadError(error) {
            console.log(error);
            reset();
        }

        function reset() {
            window.history.pushState('', '', '/');
            $scope.inputBox.value = '';
            $scope.outputBox.value = '';
            $scope.tempo.value = 80;
        }

        let _menuOpen = false;
        let _liElement = null;

        function outsideClickHandler(e) {
            let parentIsMenu = hasParentClass(e.target, 'dropdown-menu');
            if (_menuOpen === true && parentIsMenu === false) {
                window.toggleDropdown(_liElement);
            }
        }

        window.toggleDropdown = function toggleDropdown(liElement) {
            const menu = liElement.parentElement.querySelector('div.dropdown-menu');
            menu.classList.toggle('show');
            if (menu.classList.contains('show')) {
                _menuOpen = true;
                _liElement = liElement;

                setTimeout(() => {
                    document.addEventListener('click', outsideClickHandler);
                }, 0);
            } else {
                _liElement = false;
                _menuOpen = false;
                document.removeEventListener('click', outsideClickHandler);
            }
        }

        window.toggleTools = function toggleTools() {
            const footer = document.querySelector('.footer-nav');
            footer.classList.toggle('slide-zero');
        };

        let _delayedInputHandler = null;
        function onTextInput(textAreaElement) {
            if (_delayedInputHandler != null) {
                clearTimeout(_delayedInputHandler);
            }

            _delayedInputHandler = setTimeout(() => {
                transformInput($scope.inputBox.value);
                _delayedInputHandler = null;
            }, TIMEOUT_MS);

        }

        function modifyTempo(delta) {
            const originalValue = parseInt($scope.tempo.value) || 0;
            delta = delta || 0;

            $scope.tempo.value = Math.max(originalValue + delta, 30);

            if (_metronomeIsOn) {
                window.toggleMetronome();
                window.toggleMetronome();
            }
        }

        window.increaseTempo = () => { modifyTempo(1); };
        window.decreaseTempo = () => { modifyTempo(-1); };

        window.tapTempo = () => {
            const tapped = window.metronome.tap();
            if (tapped > 0) {
                $scope.tempo.value = tapped;
                modifyTempo(0);
            }
        };

        let _metronomeIsOn = false;

        window.toggleMetronome = function toggleMetronome() {
            $scope.metronomePlay.toggleClass('d-none');
            $scope.metronomeStop.toggleClass('d-none');

            if (_metronomeIsOn) {
                window.metronome.stop();
                _metronomeIsOn = false;
            } else {
                const bpm = $scope.tempo.value;
                const signature = 4;

                window.metronome.start(bpm, signature);
                _metronomeIsOn = true;
            }
        };
    });
})();