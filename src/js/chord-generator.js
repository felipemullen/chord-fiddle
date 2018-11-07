(function () {

    const SCALE = 1;
    const STRING_COUNT = 6;
    const FRETS = 6;

    const fretWidth = 10 * SCALE;
    const fretHeight = 13 * SCALE;
    const stringWidth = 1 * SCALE;
    const barWidth = 5 * SCALE;
    const fretLineWidth = 1 * SCALE;
    const headWidth = (stringWidth * 4);
    const noteSize = 8 * SCALE;
    const titleSize = 14 * SCALE;

    const _width = (fretWidth * (STRING_COUNT - 1));
    const _height = (fretHeight * (FRETS - 1));

    function drawTitle(mainGroup, titleText) {
        let title = mainGroup.text(titleText);
        title.font({ anchor: 'middle', size: titleSize });
        title.move(_width / 2, 0);
    }

    function drawOpenNotes(mainGroup, notes) {
        let openNotes = mainGroup.group();
        for (let i = 0; i < STRING_COUNT; i++) {
            let note = notes[i];
            if (note === -1 || note === 0) {
                let text = note === 0 ? 'o' : 'x';
                let n = openNotes.text(text);
                n.font({
                    anchor: 'middle',
                    size: noteSize
                });
                n.move((i * fretWidth) + (stringWidth / 2), 0);
            }
        }
        openNotes.move(0, titleSize);
    }

    function drawFretBoard(mainGroup, width, height) {
        const fretBoard = mainGroup.group();
        fretBoard.rect(width, height).fill('#d6d6d6');
        fretBoard.move(0, titleSize * 2);
        return fretBoard;
    }

    function drawFrets(fretBoard, headChord) {
        const fretGroup = fretBoard.group();
        for (let i = 0; i < FRETS; i++) {
            const p1 = { x: 0, y: fretHeight * i };
            const p2 = { x: _width + stringWidth, y: fretHeight * i };
            const fretLine = fretGroup.line(p1.x, p1.y, p2.x, p2.y);

            if (i === 0) {
                const head = fretGroup.line(p1.x, p1.y, p2.x, p2.y);
                if (headChord === true) {
                    head.stroke({ width: headWidth, color: '#000' });
                    head.move(0, (-headWidth / 2))
                } else {
                    head.stroke({ width: stringWidth, color: '#000' });
                }
            } else {
                fretLine.stroke({
                    width: fretLineWidth,
                    color: '#000'
                });
            }
        }
        // Center along string line
        fretGroup.move(0, -(fretLineWidth / 2))
        if (headChord === true)
            fretGroup.move(0, headWidth - (stringWidth / 2))
    }

    function drawStrings(fretBoard, height) {
        const stringGroup = fretBoard.group();
        for (let i = 0; i < STRING_COUNT; i++) {
            const p1 = { x: i * fretWidth, y: 0 };
            const p2 = { x: i * fretWidth, y: height };
            const string = stringGroup.line(p1.x, p1.y, p2.x, p2.y);
            string.stroke({
                width: stringWidth,
                color: '#000'
            });
        }
        // Center along line
        stringGroup.move(stringWidth / 2, 0);
    }

    function drawNoteBar(noteGroup, notes, lowestNonOpen, headChord) {
        const start = notes.indexOf(lowestNonOpen);
        const x1 = (start * fretWidth) - (barWidth / 2);
        const x2 = ((STRING_COUNT - 1) * fretWidth) + (barWidth / 2);
        let y = (lowestNonOpen * fretHeight) - (fretHeight / 2);

        if (headChord === true)
            y += (headWidth) - (stringWidth / 2);

        const bar = noteGroup.line(x1, y, x2, y);
        bar.stroke({
            width: barWidth,
            color: '#000',
            linecap: 'round'
        });
    }

    function drawNotes(noteGroup, notes, headChord) {
        for (let i = 0; i < STRING_COUNT; i++) {
            let n = notes[i];
            if (n > 0) {
                let note = noteGroup.circle(noteSize);
                let x = (i * fretWidth + (stringWidth / 2)) - (noteSize / 2);
                let y = (n * fretHeight) - (fretHeight / 2) - (noteSize / 2);
                if (headChord === true)
                    y += (headWidth) - (stringWidth / 2);
                note.move(x, y);
                note.fill({ color: "#f00" })
            }
        }
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

    function chordGraph(element, chord, notes) {

        let height = _height;
        const lowestNonOpen = notes.reduce((prev, curr) => (curr < prev && curr > 0) ? curr : prev, 50);

        const isBarChord = checkBarChord(notes, lowestNonOpen);
        const headChord = (lowestNonOpen - 1 < 2) ? true : false;

        if (headChord === true)
            height += headWidth;

        const canvas = SVG(element);
        canvas.clear();
        const mainGroup = canvas.group();

        drawTitle(mainGroup, chord);
        drawOpenNotes(mainGroup, notes);

        const fretBoard = drawFretBoard(mainGroup, _width, height);

        drawFrets(fretBoard, headChord);
        drawStrings(fretBoard, height);

        let noteGroup = fretBoard.group();

        if (isBarChord) {
            drawNoteBar(noteGroup, notes, lowestNonOpen, headChord);
            notes = notes.map((n) => {
                return (n === lowestNonOpen) ? -1 : n;
            });
        }

        drawNotes(noteGroup, notes, headChord);

        canvas.viewbox(0, 0, _width + (noteSize) + (barWidth), height + (titleSize * 3))
        mainGroup.move((noteSize / 2) + (barWidth / 2), 0)
    }

    window.ChordGraph = window.ChordGraph || chordGraph;

})();