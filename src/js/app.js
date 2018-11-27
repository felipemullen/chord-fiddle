(function () {

    const TIMEOUT_MS = 400;
    const CHORD_REGEX = /\[[A-G]7*4*#*m*(sus)*(dim)*(maj)*4*#*7*\]/g;
    const CUSTOM_REGEX = /{.{1,8}(\|(-*\d,){5}-*\d)*}/g;
    const DEFAULT_STRINGS = '-1,-1,-1,-1,-1,-1';
    const BRACKETS = /\[|\]/g;
    const EXAMPLE_SONG = `Today is gonna be the day \nthat they're gonna throw it back to you`;
    const EXAMPLE_CHORDS = [
        { position: 0, input: '[Em7]' },
        { position: 14, input: '[G]' },
        { position: 48, input: '[Dsus4]' },
        { position: 78, input: '[A7sus4]' }
    ];
    const EXAMPLE_CUSTOM_CHORDS = [
        { position: 0, input: '{B-42|-1,1,2,3,2,1}\n' },
        { position: 96, input: '\nBy now{B-42} you should have somehow...' }
    ];
    const EXAMPLE_SONG_CHORDS = `[Em7]Today is [G]gonna be the day \nthat they're [Dsus4]gonna throw it back to [A7sus4]you`;
    const EXAMPLE_SONG_CUSTOM_CHORDS = `{B-42|-1,1,2,3,2,1}\n[Em7]Today is [G]gonna be the day \nthat they're [Dsus4]gonna throw it back to [A7sus4]you\nBy now{B-42} you should have somehow...`;
    const getFiddle = firebase.functions().httpsCallable('getFiddle');
    const createFiddle = firebase.functions().httpsCallable('createFiddle');
    const updateFiddle = firebase.functions().httpsCallable('updateFiddle');

    const SPLIT_PANELS = ['#metadata', '#song', '#preview'];
    const SPLIT_GUTTER_SIZE = 10;
    let _activeChords = {};
    let _customChords = {};
    let _chordHelperElement = null;
    let _splitPanels = null;
    let _panelStates = {};
    let $scope;

    function onChordPinned(chordHelper) {
        delete _activeChords[chordHelper._chord];
    }

    let preventParse = false;
    window.showChordHelper = function showChordHelper(element) {
        preventParse = true;
        $scope.inputBox._element.blur();

        const locationRect = element.getBoundingClientRect();
        const chord = element.parentElement.getAttribute('data-chord');
        const strings = element.parentElement.getAttribute('data-strings');

        // Check custom chords first
        if (strings) {
            if (_activeChords[chord] === undefined) {
                let chordStrings = strings.split(',');
                let chordList = [chordStrings.map(Number)];
                _activeChords[chord] = new ChordHelper({
                    chord,
                    chordList,
                    x: locationRect.left,
                    y: locationRect.bottom,
                    parent: element,
                    pinCallback: onChordPinned
                });
            } else {
                // Update the strings when needed
                let activeChord = _activeChords[chord];
                if (activeChord._chordList[0].join(',') === DEFAULT_STRINGS) {
                    let cs = strings.split(',');
                    let chordList = [cs.map(Number)];
                    _activeChords[chord] = new ChordHelper({
                        chord,
                        chordList,
                        x: locationRect.left,
                        y: locationRect.bottom,
                        parent: element,
                        pinCallback: onChordPinned
                    });
                }

                _activeChords[chord].popup({ x: locationRect.left, y: locationRect.bottom, parent: element });
            }
        } else if (chord in ChordList) {
            if (_activeChords[chord] === undefined) {
                _activeChords[chord] = new ChordHelper({
                    chord,
                    chordList: ChordList[chord],
                    x: locationRect.left,
                    y: locationRect.bottom,
                    parent: element,
                    pinCallback: onChordPinned
                });
            }
            else {
                _activeChords[chord].popup({ x: locationRect.left, y: locationRect.bottom, parent: element });
            }
        }

        preventParse = false;
    };

    window.hideChordHelper = function hideChordHelper(element) {
        _chordHelperElement.classList.toggle('d-none', true);
    };

    function getChordMatches(line) {
        const matches = [];

        let customChordMatches = line.match(CUSTOM_REGEX);
        if (customChordMatches != null) {
            for (const m of customChordMatches) {
                const [name, strings] = m.split('|');
                name = name.replace(/{|}/g, '');
                strings = strings
                    ? strings.replace('}', '')
                    : DEFAULT_STRINGS;

                if (strings || _customChords[name] === undefined) {
                    _customChords[name] = {
                        name,
                        strings,
                        replacement: `{${name}}`,
                        fullMatch: `{${name}|${strings}}`
                    };
                }

                matches.push(_customChords[name]);
            }
        }

        let basicChords = line.match(CHORD_REGEX);
        if (basicChords != null) {
            for (const m of basicChords) {
                const name = m.replace(BRACKETS, '');
                matches.push({ name, replacement: m });
            }
        }

        return matches;
    }

    /**
     * @param {string} line 
     */
    function matchExpressions(line) {

        let result = `<div class="line">${line.replace(/ /g, '&nbsp;')}</div>`;
        let matches = getChordMatches(line);

        if (matches != null) {
            for (const match of matches) {
                const strings = match.strings ? `data-strings="${match.strings}"` : '';
                const chordHtml = `<span class="chord" data-chord="${match.name}" ${strings}>&nbsp;<span class="chord-above" onmouseover="showChordHelper(this)">${match.name}</span></span>`;

                result = result.replace(match.replacement, chordHtml);
                result = result.replace(match.fullMatch, chordHtml);
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

    function resizeGutter(event) {
        const targetPanelId = event.target.getAttribute('data-panel');
        const targetPanel = document.querySelector(targetPanelId);
        const currentSize = _panelStates[targetPanelId];

        // Expand if less than a third, collapse otherwise
        if (currentSize <= 33.3) {
            document.querySelectorAll('.editor-panel').forEach(panel => {
                panel.style.flexBasis = `calc(${10}% - ${SPLIT_GUTTER_SIZE}px)`;
                _panelStates[`#${panel.id}`] = 10;
            });

            targetPanel.style.flexBasis = `calc(${80}% - ${SPLIT_GUTTER_SIZE}px)`;
            _panelStates[targetPanelId] = 80;
        } else {
            document.querySelectorAll('.editor-panel').forEach(panel => {
                panel.style.flexBasis = `calc(${33.3}% - ${SPLIT_GUTTER_SIZE}px)`;
                _panelStates[`#${panel.id}`] = 33.3;
            });
        }
    }

    function toggleTransitions() {
        document.querySelectorAll('.editor-panel')
            .forEach(x => x.classList.toggle('no-transition'));
    }

    function createSplitPanels() {
        if (_splitPanels !== null) {
            _splitPanels.destroy();
        }

        _splitPanels = Split(SPLIT_PANELS, {
            elementStyle: (dimension, size, gutterSize) => ({
                'flex-basis': `calc(${size}% - ${gutterSize}px)`,
            }),
            gutterStyle: (dimension, gutterSize) => ({
                'flex-basis': `${gutterSize}px`,
            }),
            onDragStart: toggleTransitions,
            onDragEnd: toggleTransitions,
            gutter: (index, direction) => {
                const panel = SPLIT_PANELS[index];
                _panelStates[panel] = 33.3;
                const gutter = document.createElement('div');

                gutter.className = `gutter gutter-${direction}`;
                gutter.setAttribute('data-panel', panel);
                gutter.addEventListener('dblclick', resizeGutter);

                return gutter;
            },
            gutterSize: SPLIT_GUTTER_SIZE,
            minSize: 0,
            cursor: 'ew-resize'
        });
    }

    function showLoading(isLoading) {
        $scope.loadingSpinner.toggleClass('hide', !isLoading);
        $scope.editorWrapper.toggleClass('hide', isLoading);
    }

    let boxIsEmpty = false;
    let typeTimer = null;
    let charTimer = null;
    function onTutorialChange(index, element) {
        const previewChangeData = { target: { getAttribute: () => '#preview' } }
        switch (index) {
            case 0:
                if ($scope.inputBox.value === '') {
                    boxIsEmpty = true;
                    const inputData = EXAMPLE_SONG;
                    typeTimer = typeCharacters($scope.inputBox, inputData);
                }
                break;
            case 1:
                if (boxIsEmpty) {
                    if (typeTimer !== null) {
                        clearInterval(typeTimer);
                        $scope.inputBox.value = EXAMPLE_SONG;
                        typeTimer = null;
                    }

                    charTimer = changeCharacters($scope.inputBox, EXAMPLE_CHORDS);
                    boxIsEmpty = false;
                }
                break;
            case 2:
                if (charTimer !== null) {
                    clearInterval(charTimer);
                    $scope.inputBox.value = EXAMPLE_SONG_CHORDS;
                    charTimer = null;
                }

                charTimer = changeCharacters($scope.inputBox, EXAMPLE_CUSTOM_CHORDS);
                break;
            case 3:
                if (charTimer !== null) {
                    clearInterval(charTimer);
                    $scope.inputBox.value = EXAMPLE_SONG_CUSTOM_CHORDS;
                    charTimer = null;
                }

                break;
            case 4:
                resizeGutter(previewChangeData);
                setTimeout(() => {
                    __intro.refresh();
                }, 210);
                break;
            case 5:
                resizeGutter(previewChangeData);
                setTimeout(() => {
                    __intro.refresh();
                }, 210);
                break;
            default:
                break;
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        $scope = Bind.createScope();
        _chordHelperElement = document.querySelector('#chord-helper');
        $scope.inputBox.onInput = onTextInput;
        $scope.inputBox.onChange = onTextInput;
        $scope.tempo.onChange = () => { modifyTempo(0); };

        document.addEventListener('tutorials:change', (event) => {
            let data = event.detail;
            if (data)
                onTutorialChange(data.index, data.targetElement);
        }, false);

        const fiddleId = getFiddleId();
        if (fiddleId) {
            showLoading(true);
            getFiddle({ id: fiddleId })
                .then((result) => {
                    loadFiddle(result);
                    showLoading(false);
                    createSplitPanels();

                    const data = { target: { getAttribute: () => '#preview' } }
                    resizeGutter(data);
                })
                .catch(loadError);
        } else {
            showLoading(false);
            createSplitPanels();
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

            showLoading(true);

            const loadPromise = (id)
                ? updateFiddle({ id, fiddle })
                : createFiddle(fiddle);

            loadPromise.then(data => {
                loadFiddle(data);
                showLoading(false);
                createSplitPanels();

                const e = { target: { getAttribute: () => '#preview' } }
                resizeGutter(e);
            }).catch(loadError);
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
            _activeChords = {};
            _customChords = {};
            $scope.inputBox.value = '';
            $scope.outputBox.value = '';
            $scope.tempo.value = 80;
        }

        window.copyToClipboard = function () {
            const link = getShareLink();
            const textArea = document.createElement('textarea');
            textArea.value = link;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        };

        function getShareLink() {
            const fiddleId = getFiddleId();

            if (fiddleId) {
                return `${window.location.host}?f=${fiddleId}`;
            }
        }

        let _currentMenu = '';
        function outsideClickHandler(e) {
            if (_currentMenu !== '') {
                let parentIsMenu = hasParentClass(e.target, _currentMenu);
                if (parentIsMenu === false) {
                    window.toggleMenu(_currentMenu);
                }
            }
        }

        function showMenu(menuName) {
            if (menuName === 'share-menu') {
                const input = document.querySelector('.share-menu input.share-link');
                input.value = getShareLink();
            }

            const menu = document.querySelector(`div.dropdown-menu.${menuName}`);
            menu.classList.toggle('show', true);
            _currentMenu = menuName;
        }

        function hideMenu(menuName) {
            const menu = document.querySelector(`div.dropdown-menu.${menuName}`);
            menu.classList.toggle('show', false);
        }

        window.toggleMenu = function toggleMenu(menuName) {
            if (_currentMenu === menuName) {
                hideMenu(menuName);
                document.removeEventListener('click', outsideClickHandler);
                _currentMenu = '';
            } else if (_currentMenu === '') {
                showMenu(menuName);
                setTimeout(() => {
                    document.addEventListener('click', outsideClickHandler);
                }, 0);
            } else {
                hideMenu(_currentMenu);
                document.removeEventListener('click', outsideClickHandler);

                showMenu(menuName);
                setTimeout(() => {
                    document.addEventListener('click', outsideClickHandler);
                }, 0);
            }
        };

        window.toggleTools = function toggleTools() {
            const footer = document.querySelector('.footer-nav');
            footer.classList.toggle('slide-zero');
        };

        let _delayedInputHandler = null;
        function onTextInput(textAreaElement) {
            if (preventParse === true)
                return;

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