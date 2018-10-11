import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { logger } from 'util/logger-helper';

@inject(Router)
export class NexusView {

    constructor(router) {
        this.router = router;
    }

    created(owningView, myView) {
        this.parentView = owningView.bindingContext;
    }

    attached() {
    }

    detached() {
    }

    activate(params, routeConfig, navigationInstruction) {
        return new Promise(resolve => {
            resolve();
        });
    }

    deactivate = () => {
        return new Promise(resolve => {
            resolve();
        });
    }

    goToResetPassword(event) {
        this.router.navigateToRoute('reset-password');
    }
}
