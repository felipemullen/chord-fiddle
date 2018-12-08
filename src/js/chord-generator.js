(function () {

    const STRING_COUNT = 6;
    const FRETS = 6;
    const tuning = ['E', 'A', 'D', 'G', 'B', 'E'];

    function drawTitle(parentGroup, chartInfo) {
        let title = parentGroup.text(chartInfo.chord);
        title.font({ anchor: 'middle', size: chartInfo.titleFontSize });
        title.move(chartInfo.fretBoardWidth / 2, 0);
        title.addClass('fretboard-text');

        chartInfo.height += title.bbox().h;
    }

    function drawOpenNotes(parentGroup, chartInfo) {
        let openNotes = parentGroup.group();
        for (let i = 0; i < STRING_COUNT; i++) {
            let note = chartInfo.notes[i];
            if (note === -1 || note === 0) {
                let text = note === 0 ? 'o' : '×';
                let n = openNotes.text(text);
                n.font({
                    anchor: 'middle',
                    size: chartInfo.noteCircleSize
                });
                n.move((i * chartInfo.fretWidth) + (chartInfo.stringSize / 2), 0);
                n.addClass('fretboard-text');
            }
        }
        openNotes.move(0, chartInfo.height);
        chartInfo.height += openNotes.bbox().h;
    }

    function drawFretBoard(parentGroup, chartInfo) {
        const fretBoard = parentGroup.group();
        fretBoard.rect(chartInfo.fretBoardWidth, chartInfo.fretBoardHeight);
        fretBoard.move(0, chartInfo.height);
        fretBoard.addClass('fretboard');

        drawFrets(parentGroup, chartInfo);
        drawStrings(parentGroup, chartInfo);
        drawNotes(parentGroup, chartInfo);

        chartInfo.height += fretBoard.bbox().h;

        // The last string is drawn from chartInfo.height to the bottom, but
        // svg.line elements are not counted as height, so we need another increment
        chartInfo.height += chartInfo.stringSize;
    }

    function drawHead(parentGroup, chartInfo) {
        const size = chartInfo.isHeadChord ? chartInfo.headSize : chartInfo.stringSize;
        const adjustedY = chartInfo.height + (size / 2);

        const head = parentGroup.line(0, adjustedY, chartInfo.fretBoardWidth, adjustedY);
        head.stroke({ width: size });
        head.addClass('fretboard-lines');

        chartInfo.height += size;
    }

    function drawFrets(parentGroup, chartInfo) {
        const fretGroup = parentGroup.group();
        for (let i = 1; i < FRETS; i++) {

            const fretY = i * chartInfo.fretHeight + (chartInfo.fretLineSize / 2);
            const fretLine = fretGroup.line(0, fretY, chartInfo.fretBoardWidth, fretY);
            fretLine.stroke({ width: chartInfo.fretLineSize });
            fretLine.addClass('fretboard-lines');
        }
        fretGroup.move(0, chartInfo.height);
    }

    function drawStrings(fretBoard, chartInfo) {
        const stringGroup = fretBoard.group();
        for (let i = 0; i < STRING_COUNT; i++) {
            const offset = (i === 0)
                ? (chartInfo.stringSize / 2)
                : ((i === STRING_COUNT - 1) ? -(chartInfo.stringSize / 2) : 0);

            const x = i * chartInfo.fretWidth + offset;
            const string = stringGroup.line(x, 0, x, chartInfo.fretBoardHeight);
            string.stroke({ width: chartInfo.stringSize });
            string.addClass('fretboard-lines');
        }
        stringGroup.move(0, chartInfo.height);
    }

    function drawNotes(parentGroup, chartInfo) {
        let noteGroup = parentGroup.group();

        if (chartInfo.isBarChord) {
            const startString = chartInfo.notes.indexOf(chartInfo.lowestNonOpen);
            const x1 = (startString * chartInfo.fretWidth) - (chartInfo.barSize / 4);
            const x2 = ((STRING_COUNT - 1) * chartInfo.fretWidth) + (chartInfo.barSize / 4);
            let y = ((chartInfo.lowestNonOpen + chartInfo.yOffset) * chartInfo.fretHeight) - (chartInfo.fretHeight / 2);

            const bar = noteGroup.line(x1, y, x2, y);
            bar.stroke({
                width: chartInfo.barSize,
                linecap: 'round'
            });
            bar.addClass('fretboard-notes');
            chartInfo.notes = chartInfo.notes.map((n) => {
                return (n === chartInfo.lowestNonOpen) ? -1 : n;
            });
        }

        for (let i = 0; i < STRING_COUNT; i++) {
            let n = chartInfo.notes[i];
            if (n > 0) {
                // x offset is added because strings (svg.line) are center-based and
                // the edges were drawn a half-width closer to the center
                const offset = (i === 0)
                    ? (chartInfo.stringSize / 2)
                    : ((i === STRING_COUNT - 1) ? -(chartInfo.stringSize / 2) : 0);

                const note = noteGroup.circle(chartInfo.noteCircleSize);
                const x = (i * chartInfo.fretWidth) - (chartInfo.noteCircleSize / 2) + offset;
                const y = ((n + chartInfo.yOffset) * chartInfo.fretHeight) - (chartInfo.fretHeight / 2) - (chartInfo.noteCircleSize / 2);

                note.move(x, y);
                note.addClass('fretboard-notes');
            }
        }

        if (chartInfo.isBarChord && chartInfo.yOffset !== 0) {
            const annotation = noteGroup.text(`${chartInfo.lowestNonOpen} fr`);
            annotation.font({
                anchor: 'middle',
                size: chartInfo.textAnnotationSize
            });

            const x = -(chartInfo.textAnnotationSize * 2) + (chartInfo.textAnnotationSize / 4);
            const y = ((chartInfo.lowestNonOpen + chartInfo.yOffset) * chartInfo.fretHeight) - (chartInfo.fretHeight / 2) - (chartInfo.textAnnotationSize / 2);

            annotation.move(x, y);
            annotation.addClass('fretboard-text');
        }

        noteGroup.move(0, chartInfo.height);
    }

    function drawStringNames(parentGroup, chartInfo) {
        const stringNames = parentGroup.group();
        for (let i = 0; i < tuning.length; i++) {
            const name = tuning[i];
            let n = stringNames.text(name);
            n.font({
                anchor: 'middle',
                size: chartInfo.noteCircleSize
            });
            n.move((i * chartInfo.fretWidth) + (chartInfo.stringSize / 2), 0);
            n.addClass('fretboard-text');
        }
        // Center along line
        stringNames.move(0, chartInfo.height);
        chartInfo.height += stringNames.bbox().h;
    }

    function checkBarChord(notes, lowestNonOpen) {
        if (lowestNonOpen > -1) {

            let lowNoteCount = 0;
            let firstLowNoteIndex = null;
            let lastLowNoteIndex = null;

            for (let i = 0; i < notes.length; i++) {
                const note = notes[i];

                if (note === lowestNonOpen) {
                    lowNoteCount++;
                    if (firstLowNoteIndex === null)
                        firstLowNoteIndex = i;
                    lastLowNoteIndex = i;
                }
            }

            // This check is here to prevent a bar from being drawn over a chord
            // like 'D' where it doesn't make sense. The distance between top and 
            // bottom should be greater than 2
            const barNotesDistance = lastLowNoteIndex - firstLowNoteIndex;
            return (lowNoteCount > 1 && (lastLowNoteIndex == STRING_COUNT - 1) && barNotesDistance > 2);
        }

        return false;
    }

    function getChartInfo(chord, notes) {
        const lowestNonOpen = notes.reduce((prev, curr) => (curr < prev && curr > 0) ? curr : prev, 50);
        const isHeadChord = (lowestNonOpen - 1 < 2) ? true : false;
        const stringSize = 1;
        const fretWidth = 10;
        const fretHeight = 12;

        return {
            chord,
            notes,
            stringSize,
            fretWidth,
            fretHeight,
            lowestNonOpen,
            isHeadChord,
            fretBoardWidth: (fretWidth * (STRING_COUNT - 1)),
            fretBoardHeight: (fretHeight * (FRETS - 1)),
            isBarChord: checkBarChord(notes, lowestNonOpen),
            // offset all notes on the fretboard so they are never more
            // than 1 fret away from the head
            yOffset: (lowestNonOpen > 2) ? ((-lowestNonOpen) + 1) : 0,
            barSize: 5,
            fretLineSize: 1,
            headSize: (stringSize * 4),
            noteCircleSize: 7,
            textAnnotationSize: 10,
            titleFontSize: 14,
            height: 0
        };
    }

    /**
     * Entry point for drawing chord as svg
     * @param { HTMLElement } element 
     * @param { String } chord 
     * @param { Array } notes 
     */
    function chordGraph(element, chord, notes) {

        const chartInfo = getChartInfo(chord, notes);

        const canvas = SVG(element);
        const mainGroup = canvas.group();

        drawTitle(mainGroup, chartInfo);

        // Add some extra padding under title
        chartInfo.height += chartInfo.titleFontSize / 2;

        drawOpenNotes(mainGroup, chartInfo);
        drawHead(mainGroup, chartInfo);

        drawFretBoard(mainGroup, chartInfo);

        // Add some padding before the string names
        chartInfo.height += chartInfo.noteCircleSize;

        drawStringNames(mainGroup, chartInfo);

        const edgePadding = (chartInfo.noteCircleSize / 2) * 2;
        canvas.viewbox(-edgePadding - (chartInfo.textAnnotationSize * 2), 0, chartInfo.fretBoardWidth + edgePadding * 2 + (chartInfo.textAnnotationSize * 2), chartInfo.height);
    }

    window.ChordGraph = window.ChordGraph || chordGraph;

})();