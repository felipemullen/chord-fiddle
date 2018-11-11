(function () {
    const template = `
        <div class="top-btn-wrap d-flex justify-content-between">
            <button class="top-btn btn btn-sm btn-light text-muted">
                <i class="fas fa-arrows-alt"></i>
            </button>
            <button class="top-btn btn btn-sm btn-light text-muted">
                <i class="fas fa-thumbtack"></i>
            </button>
        </div>
        <div class="diagram"></div>
        <div class="dropdown-divider mb-0"></div>
        <div class="d-flex justify-content-between">
            <button class="btn btn-sm btn-light text-muted left-button">
                <i class="fas fa-arrow-left"></i>
            </button>
            <span class="btn btn-sm text-muted index-label">1 of 16</span>
            <button class="btn btn-sm btn-light text-muted right-button">
                <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;

    class ChordHelper {
        constructor({ chord, x, y, parent }) {
            this._chordIndex = 0;

            this._wrapperElement = document.createElement('div');
            this._wrapperElement.innerHTML = template;
            this._wrapperElement.classList.add('chord-helper', 'd-none');

            this._diagramElement = this._wrapperElement.querySelector('.diagram');
            this._leftButton = this._wrapperElement.querySelector('.left-button');
            this._rightButton = this._wrapperElement.querySelector('.right-button');
            this._indexLabel = this._wrapperElement.querySelector('.index-label');

            this.attachButtonListeners();

            this._chord = chord;
            this._chordList = ChordList[chord];

            this._wrapperElement.style.left = `${x}px`;
            this._wrapperElement.style.top = `${y}px`;

            this.attachParent(parent);
            this.scroll(0);
            this.show();
            this.generateDiagram();
        }

        updateIndexLabel() {
            this._indexLabel.innerHTML = `${this._chordIndex + 1} of ${this._chordList.length}`;
        }

        scroll(offset) {
            this._chordIndex = (this._chordIndex + offset) % this._chordList.length;
            if (this._chordIndex < 0)
                this._chordIndex = this._chordIndex = this._chordList.length - 1;

            this.updateIndexLabel();
            this.generateDiagram();
        }

        scrollLeft() { this.scroll(-1); }
        scrollRight() { this.scroll(1); }

        attachButtonListeners() {
            this._leftButton.addEventListener('click', this.scrollLeft.bind(this));
            this._rightButton.addEventListener('click', this.scrollRight.bind(this));
        }

        parentMouseOut() {
            // TODO: Check if it is not pinned, hide as needed
            console.log(`mouseOut fired`);
            this.hide();
        }

        detachParent() {
            if (this._parent) {
                console.log(`removing parent listener`);

                this._parent.removeEventListener('mouseleave', this.parentMouseOut);
                this._parent = null;
            }
        }

        /**
         * @param { HTMLElement } parent
         */
        attachParent(parent) {
            console.log(`attaching parent listener`);

            this.detachParent(parent);

            parent.append(this._wrapperElement);
            parent.addEventListener('mouseleave', this.parentMouseOut.bind(this));
            this._parent = parent;
        }

        generateDiagram() {
            this._notes = ChordList[this._chord][this._chordIndex];

            if (this._diagramElement.childElementCount > 0)
                this._diagramElement.querySelector('svg').remove();

            ChordGraph(this._diagramElement, this._chord, this._notes);
        }

        move({ x, y, parent }) {
            if (this._parent !== parent) {
                console.log(`moving parent listener`);

                // TODO: Add logic for not within window boundaries
                this._wrapperElement.style.left = `${x}px`;
                this._wrapperElement.style.top = `${y}px`;

                this.attachParent(parent);
            }

            this.show();
        }

        show() {
            this._wrapperElement.classList.toggle('d-none', false);
        }

        hide() {
            this._wrapperElement.classList.toggle('d-none', true);
        }
    }

    window.ChordHelper = window.ChordHelper || ChordHelper;
})();