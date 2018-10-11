import { inject } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';
import { WindowHelper } from 'util/window-helper';

@inject(DialogController, WindowHelper)
export class AcknowledgementDialogViewModel {
    _model;
    onKeypressInputCallback;

    constructor(dialogController, i18n, windowHelper) {
        this.dialogController = dialogController;
        this.windowHelper = windowHelper;

        this.onKeypressInputCallback = this.onKeypressInput.bind(this);
    }

    created(owningView, myView) {
        this.parentView = owningView.bindingContext;
    }

    attached() {
    }

    activate(model) {
        return new Promise(resolve => {
            this._model = model;
            this.windowHelper.addEventListener('keypress', this.onKeypressInputCallback, false);
            resolve();
        });
    }

    deactivate = () => {
        return new Promise(resolve => {
            this.windowHelper.removeEventListener('keypress', this.onKeypressInputCallback);
            resolve();
        });
    }

    detached() {
    }

    onKeypressInput(event) {
        if (typeof event !== 'undefined') {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.confirm(event);
            }
        }
    }

    cancel(event) {
        this.dialogController.cancel();
    }

    ok(event) {
        this.dialogController.ok();
    }
}