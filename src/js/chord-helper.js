(function () {
    const template = `
        <div class="top-btn-wrap d-flex justify-content-between">
            <a><button class="invisible top-btn btn btn-sm btn-light text-muted move-chord">
                <i class="fas fa-arrows-alt"></i>
            </button></a>
            <a><button class="top-btn btn btn-sm btn-light pin-chord">
                <i class="fas fa-thumbtack"></i>
            </button></a>
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
        constructor({ chord, x, y, parent, pinCallback }) {
            this._chordIndex = 0;
            this._mouseOffsetX = 0;
            this._mouseOffsetY = 0;
            this._isPinned = false;
            this._pinCallback = pinCallback;

            this._wrapperElement = document.createElement('div');
            this._wrapperElement.innerHTML = template;
            this._wrapperElement.classList.add('chord-helper', 'd-none');
            this._wrapperElement.draggable = true;
            this._wrapperElement.onmousedown = this.onMouseDown.bind(this);
            this._wrapperElement.ondragend = this.moveEvent.bind(this);

            this._diagramElement = this._wrapperElement.querySelector('.diagram');
            this._moveButton = this._wrapperElement.querySelector('.move-chord');
            this._pinButton = this._wrapperElement.querySelector('.pin-chord');
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

        togglePin() {
            // When toggling pin off from a chord already pinned, remove the element
            if (this._isPinned === true) {
                this._wrapperElement.remove();
                return;
            }

            this._isPinned = !this._isPinned;
            this._moveButton.classList.toggle('invisible');
            this._pinButton.classList.toggle('pinned');

            this.moveEvent({ offsetX: 0, offsetY: 0 });

            if (this._pinCallback)
                this._pinCallback(this);
        }

        attachButtonListeners() {
            this._leftButton.addEventListener('click', this.scrollLeft.bind(this));
            this._rightButton.addEventListener('click', this.scrollRight.bind(this));
            this._pinButton.addEventListener('click', this.togglePin.bind(this));
        }

        parentMouseOut() {
            this.hide();
        }

        detachParent() {
            if (this._parent) {
                this._parent.removeEventListener('mouseleave', this.parentMouseOut);
                this._parent = null;
            }
        }

        /**
         * @param { HTMLElement } parent
         */
        attachParent(parent) {
            this.detachParent();

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

        popup({ x, y, parent }) {
            if (this._parent !== parent) {
                this.attachParent(parent);
            }

            this._wrapperElement.style.left = `${x}px`;
            this._wrapperElement.style.top = `${y}px`;

            this.show();
        }

        ensureWithinWindow() {
            const bounds = document.body.getBoundingClientRect()
            const elementRect = this._wrapperElement.getBoundingClientRect();

            if (elementRect.right >= bounds.right)
                this._wrapperElement.style.left = `${bounds.right - elementRect.width}px`;

            if (elementRect.left <= 0)
                this._wrapperElement.style.left = '0px';

            if (elementRect.bottom >= bounds.bottom)
                this._wrapperElement.style.top = `${bounds.bottom - elementRect.height}px`;

            if (elementRect.top <= 0)
                this._wrapperElement.style.top = '0px';
        }

        show() {
            this._wrapperElement.classList.toggle('d-none', false);
            this.ensureWithinWindow();
        }

        hide() {
            if (this._isPinned === false) {
                this._wrapperElement.classList.toggle('d-none', true);
            }
        }

        /**
         * This function exists to correct the mouse offset problem
         * @param { MouseEvent } e 
         */
        onMouseDown(event) {
            if (this._isPinned) {
                this._mouseOffsetX = event.clientX - this._wrapperElement.getBoundingClientRect().left;
                this._mouseOffsetY = event.clientY - this._wrapperElement.getBoundingClientRect().top;
            }
        }

        moveEvent(event) {
            const left = parseInt(this._wrapperElement.style.left.replace('px', ''));
            const top = parseInt(this._wrapperElement.style.top.replace('px', ''));

            let x = left + event.offsetX - this._mouseOffsetX;
            let y = top + event.offsetY - this._mouseOffsetY;

            this.popup({ x, y, parent: document.body });
        }
    }

    window.ChordHelper = window.ChordHelper || ChordHelper;
})();