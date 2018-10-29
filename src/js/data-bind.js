/**
 * A simple DOM-to-js data binding model in vanilla javascript.
 * USAGE:
 *      let el = new Bind(document.querySelector('#my-bind'));
 *      el = 10;
 *      console.log(el) // 10
 */
(function () {
    if (!window.Bind) {

        class BindedElement {

            static createScope(selector = '[bind]') {
                let scope = {};

                elements = document.querySelectorAll(selector);
                for (const element of elements) {
                    let bindName = element.getAttribute('bind');
                    scope[bindName] = new BindedElement(element);
                    // scope[bindName] = function () {
                    //     if (arguments.length > 0)
                    //         element.value = arguments[0];
                    //     else
                    //         return element.value;
                    // };
                }

                return scope;
            }

            /**
             * @param { HTMLElement } element
             */
            constructor(element) {
                this._element = element;
                this._onInputHandler = null;
                this._onChangeHandler = null;
                this._element.addEventListener('input', this._inputFunction.bind(this));
                this._element.addEventListener('change', this._changeFunction.bind(this));
            }

            get value() {
                return this._element.value;
            }

            set value(v) {
                this._element.value = v;
                this._inputFunction();
            }

            toggleClass(name, forcedValue) {
                this._element.classList.toggle(name, forcedValue);
            }

            html() {
                if (arguments.length > 0)
                    this._element.innerHTML = arguments[0];
                else
                    return this._element.innerHTML;
            }

            text() {
                if (arguments.length > 0)
                    this._element.innerText = arguments[0];
                else
                    return this._element.innerText;
            }

            /**
             * Can be set to a function that will run on 'input' event of input types
             */
            set onInput(handler) {
                this._onInputHandler = handler;
            }

            _inputFunction(e) {
                if (this._onInputHandler !== null)
                    this._onInputHandler(e);
            }

            set onChange(handler) {
                this._onChangeHandler = handler;
            }

            _changeFunction(e) {
                if (this._onChangeHandler !== null)
                    this._onChangeHandler(e);
            }
        }

        window.Bind = BindedElement;
    }
})();