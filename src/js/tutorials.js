(function () {
    const STORAGE_KEY = 'cfTutorialState';
    let _currentStepIndex = 0;
    let _intro = null;

    function insert(original, index, value) {
        return original.substr(0, index) + value + original.substr(index);
    }

    window.typeCharacters = function typeCharacters(element, input) {
        let i = 0;
        const timer = setInterval(() => {
            if (input[i]) {
                element.value += input[i++];
            } else {
                clearTimeout(timer);
            }
        }, 50);

        return timer;
    }

    window.changeCharacters = function changeCharacters(element, inputs) {
        let i = 0;
        let p = 0;
        const timer = setInterval(() => {
            if (inputs[p]) {
                let position = inputs[p].position;
                let character = inputs[p].input[i];
                if (character) {
                    element.value = insert(element.value, position + i, character);
                    i++;
                } else {
                    i = 0;
                    p++;
                }
            } else {
                clearTimeout(timer);
            }
        }, 100);

        return timer;
    }

    window.showTutorials = function showTutorials() {
        _currentStepIndex = 0;

        if (_intro === null) {
            const _options = {
                skipLabel: 'done',
                hidePrev: true,
                hideNext: true,
                showStepNumbers: false,
                scrollToElement: false,
                disableInteraction: true,
                showBullets: false,
                tooltipClass: 'tuts-tooltip',
                hints: [
                    {
                        hint: 'text for the hint',
                        element: '#tut-song',
                        hintPosition: `center-middle`,
                        hintAnimation: true
                    }
                ],
                steps: [
                    {
                        name: 'welcome',
                        intro: 'Welcome to Chord Fiddle :)',
                    },
                    {
                        name: 'song-panel-start',
                        element: '#song',
                        intro: 'The song panel is where you can start writing your song',
                    },
                    {
                        name: 'song-panel-chords',
                        element: '#song',
                        intro: 'Add chords by using bracket notation',
                    },
                    {
                        name: 'song-panel-custom',
                        element: '#song',
                        intro: 'You can write custom chords using curly braces'
                    },
                    {
                        name: 'right-gutter',
                        element: document.querySelectorAll('.gutter.gutter-horizontal')[1],
                        intro: 'Drag or double click a gutter to auto-resize the panels',
                    },
                    {
                        name: 'preview-panel',
                        element: '#preview',
                        intro: 'The preview panel shows a complete version of your song',
                    },
                    {
                        name: 'metadata-panel',
                        element: '#metadata',
                        intro: 'Store metadata and notes about your song',
                    },
                    {
                        name: 'tools-button',
                        element: '#tut-tools',
                        intro: `Need a metronome or a quick tune? You're covered.`,
                    },
                    {
                        name: 'save-button',
                        element: '#tut-save',
                        intro: `When you're done, save your song and write down the unique URL`,
                    },
                    {
                        name: 'end',
                        intro: `Now start making some great music! 🎶`,
                    }
                ]
            };

            _intro = introJs();
            _intro.setOptions(_options);
            window.__intro = _intro;
        }

        _intro.start();
        _intro.onbeforechange(function (targetElement) {
            const data = { targetElement, index: _currentStepIndex }
            const event = new CustomEvent('tutorials:change', { detail: data });
            document.dispatchEvent(event);
            _currentStepIndex++;
        });
        _intro.onexit(() => {
            const storageData = JSON.stringify({ complete: true });
            window.localStorage.setItem(STORAGE_KEY, storageData);
            const event = new CustomEvent('tutorials:exit');
            this.document.dispatchEvent(event);
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        const storageJson = window.localStorage.getItem(STORAGE_KEY);
        const tutorialState = JSON.parse(storageJson);

        if (!tutorialState || tutorialState.complete !== true) {
            window.showTutorials();
        }
    });

})();