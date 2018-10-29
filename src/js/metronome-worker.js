(function () {
    let _bpm = 100;
    let _beatHandler = null;
    let _currentBeat = 1;
    let _beatSignature = 4;

    function tickInterval() {
        if (_currentBeat == 1) {
            self.postMessage('onbeat');
        }
        else {
            self.postMessage('offbeat');
        }

        _currentBeat = (_currentBeat + 1) % _beatSignature;
    }

    self.addEventListener('message', (e) => {
        const { action, bpm, signature } = e.data;
        
        if (action === 'start') {
            _bpm = bpm;
            _beatSignature = signature;
            start();
        }
        else if (action === 'stop') {
            stop();
        }
    });

    function start() {
        _currentBeat = 1;
        _beatHandler = setInterval(tickInterval, (60 / _bpm) * 1000)
    };

    function stop() {
        clearInterval(_beatHandler);
    };
})();