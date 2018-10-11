import { ValidationRenderer, RenderInstruction, ValidateResult } from 'aurelia-validation';

if (window.Element && !Element.prototype.closest) {
    Element.prototype.closest = function (s) {
        let matches = (this.document || this.ownerDocument).querySelectorAll(s);
        let i;
        let el = this;
        do {
            i = matches.length;
            while (--i >= 0 && matches.item(i) !== el) { };
        } while ((i < 0) && (el = el.parentElement));
        return el;
    };
}

export class AureliaUXValidationRenderer {
    render(instruction) {
        for (let { result, elements } of instruction.unrender) {
            for (let element of elements) {
                AureliaUXValidationRenderer.remove(element, result);
            }
        }

        for (let { result, elements } of instruction.render) {
            if (!result.valid) {
                for (let element of elements) {
                    AureliaUXValidationRenderer.add(element, result);
                }
            }
        }
    }

    static add(element, result) {
        if (result.valid) {
            return;
        }

        if (!element) {
            return;
        }
        element.classList.add('has-error');

        const uxField = element.closest('ux-field');
        if (!uxField) {
            return;
        }

        const uxInputInfo = uxField.querySelector('ux-input-info');
        if (!uxInputInfo) {
            return;
        }

        // add help-block
        const message = document.createElement('span');
        message.className = 'error-text';
        message.textContent = result.message;
        message.id = `validation-message-${result.id}`;
        uxInputInfo.insertBefore(message, uxInputInfo.firstChild);
    }

    static remove(element, result) {
        if (result.valid) {
            return;
        }

        if (!element) {
            return;
        }

        element.classList.remove('has-error');

        const uxField = element.closest('ux-field');
        if (!uxField) {
            return;
        }

        const uxInputInfo = uxField.querySelector('ux-input-info');
        if (!uxInputInfo) {
            return;
        }

        // remove help-block
        const message = uxInputInfo.querySelector(`#validation-message-${result.id}`);
        if (message) {
            uxInputInfo.removeChild(message);

            // remove the has-error class from the enclosing form-group div
            if (uxInputInfo.querySelectorAll('.help-block.validation-message').length === 0) {
                uxInputInfo.classList.remove('has-error');
            }
        }
    }
}
