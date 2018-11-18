(function () {
    const STORAGE_KEY = 'cfTutorialState';
    let _intro = null;
    
    window.showTutorials = function showTutorials() {
        if (_intro === null) {
            const _options = {
                skipLabel: 'done',
                hidePrev: true,
                hideNext: true,
                showStepNumbers: false,
                scrollToElement: false,
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
                        name: 'song-panel',
                        element: '#song',
                        intro: 'The song panel is where you can start writing your song',
                    },
                    {
                        name: 'left-gutter',
                        element: document.querySelectorAll('.gutter.gutter-horizontal')[0],
                        intro: 'Resize your working area using the side bars',
                    },
                    {
                        name: 'right-gutter',
                        element: document.querySelectorAll('.gutter.gutter-horizontal')[1],
                        intro: 'Double clicking a gutter will auto-resize the panels',
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
                        name: 'share-button',
                        element: '#tut-share',
                        intro: `...Or you can share it from here`,
                    },
                    {
                        name: 'end',
                        intro: `Now start making some great music! 🎶`,
                    }
                ]
            };

            _intro = introJs();
            _intro.setOptions(_options);
        }

        _intro.start();
        _intro.onexit(() => {
            const storageData = JSON.stringify({ complete: true });
            window.localStorage.setItem(STORAGE_KEY, storageData);
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