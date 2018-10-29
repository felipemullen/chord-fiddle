(function () {

    const strings = {
        e2: new Audio('https://firebasestorage.googleapis.com/v0/b/chord-fiddle.appspot.com/o/tune-e2.wav?alt=media&token=f3dd1fd3-2dc5-4c0a-bb53-18f89bb8a28c'),
        a2: new Audio('https://firebasestorage.googleapis.com/v0/b/chord-fiddle.appspot.com/o/tune-a2.wav?alt=media&token=0e9572f2-b0c8-42d3-9d29-ce3ddeb3b8ef'),
        d3: new Audio('https://firebasestorage.googleapis.com/v0/b/chord-fiddle.appspot.com/o/tune-d3.wav?alt=media&token=5f5ea7be-8fde-4398-95f5-949e864f2172'),
        g3: new Audio('https://firebasestorage.googleapis.com/v0/b/chord-fiddle.appspot.com/o/tune-g3.wav?alt=media&token=93f272a1-8829-4d91-83f4-91e264341dad'),
        b3: new Audio('https://firebasestorage.googleapis.com/v0/b/chord-fiddle.appspot.com/o/tune-b3.wav?alt=media&token=01143125-17cc-4774-9bde-358425cf0db0'),
        e4: new Audio('https://firebasestorage.googleapis.com/v0/b/chord-fiddle.appspot.com/o/tune-e4.wav?alt=media&token=6caa5cf7-a4bd-4429-843d-4b6d55ee7460')
    };

    function playSound(element, stringName) {
        element.classList.add('play');
        const toPlay = strings[stringName];
        toPlay.pause();
        toPlay.currentTime = 0;
        toPlay.play();
        toPlay.onended = () => {
            element.classList.remove('play');
        };
    }

    function initialize() {
        const tuningButtons = document.querySelectorAll('button[string]');

        for (const button of tuningButtons) {
            // Cloning the node in order to remove any previous listeners
            const newButton = button.cloneNode(true);

            newButton.addEventListener('click', () => {
                const stringName = newButton.getAttribute('string');
                playSound(newButton, stringName);
            });

            button.parentNode.replaceChild(newButton, button);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        initialize();
    });
})();