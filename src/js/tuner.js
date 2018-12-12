(function () {

    const strings = {
        e1: new Audio('https://firebasestorage.googleapis.com/v0/b/chord-fiddle.appspot.com/o/tuning%2Fstandard%2FE1.m4a?alt=media&token=bc9830c7-9322-481c-a55f-5d30bfd8c154'),
        a1: new Audio('https://firebasestorage.googleapis.com/v0/b/chord-fiddle.appspot.com/o/tuning%2Fstandard%2FA1.m4a?alt=media&token=8e353311-ca59-45fd-ac70-a0cb403034e2'),
        d2: new Audio('https://firebasestorage.googleapis.com/v0/b/chord-fiddle.appspot.com/o/tuning%2Fstandard%2FD2.m4a?alt=media&token=debdfae5-f128-4864-abe4-6028a8432f3e'),
        g2: new Audio('https://firebasestorage.googleapis.com/v0/b/chord-fiddle.appspot.com/o/tuning%2Fstandard%2FG2.m4a?alt=media&token=0cd2df7c-098d-4f8d-b2da-1a88465a228a'),
        b2: new Audio('https://firebasestorage.googleapis.com/v0/b/chord-fiddle.appspot.com/o/tuning%2Fstandard%2FB2.m4a?alt=media&token=33794f74-a5e3-4e59-8077-600f9fb48f29'),
        e3: new Audio('https://firebasestorage.googleapis.com/v0/b/chord-fiddle.appspot.com/o/tuning%2Fstandard%2FE3.m4a?alt=media&token=1d2ee008-d311-4c4b-af65-ba8aa90e201a')
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