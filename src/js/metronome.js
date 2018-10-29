(function () {
    const firstClick = new Audio('https://firebasestorage.googleapis.com/v0/b/chord-fiddle.appspot.com/o/metronome-start.wav?alt=media&token=645cf53c-019c-4831-8372-7d4173f28028');
    const beatClick = new Audio('https://firebasestorage.googleapis.com/v0/b/chord-fiddle.appspot.com/o/metronome-beat.wav?alt=media&token=d155b9b4-dc67-4dd3-af48-162f0e306aef');

    const metronomeWorker = new Worker('metronome-worker.js');

    let _lastTapTime;
    let _previousBpm;
    let _tappedBpm;

    metronomeWorker.addEventListener('message', (e) => {
        if (e.data === 'onbeat') {
            firstClick.play();
        }
        else if (e.data === 'offbeat') {
            beatClick.pause();
            beatClick.currentTime = 0;
            beatClick.play();
        }
    });

    window.metronome = window.metronome || {};

    window.metronome.start = function (bpm, signature) {
        metronomeWorker.postMessage({
            bpm,
            signature,
            action: 'start'
        });
    };

    window.metronome.stop = function () {
        metronomeWorker.postMessage({ action: 'stop' });
    }

    window.metronome.tap = function () {
        if (!_lastTapTime) {
            _lastTapTime = new Date().getTime();
            return 0;
        }

        const now = new Date().getTime();
        const delta = now - _lastTapTime;

        _tappedBpm = (1000 * 60) / delta;
        if (_previousBpm) {
            _tappedBpm = (_tappedBpm + _previousBpm) / 2;
        }

        _previousBpm = _tappedBpm;
        _lastTapTime = now;

        return Math.round(_tappedBpm);
    };
})();