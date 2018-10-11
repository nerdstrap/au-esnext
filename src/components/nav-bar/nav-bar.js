import { inject, bindable } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { AuthService } from 'aurelia-authentication';
import { logger } from 'util/logger-helper';

@inject(Router, AuthService)
export class NavBar {
    @bindable router = null;
    @bindable username = null;

    constructor(router, authService) {
        this.router = router;
        this.authService = authService;
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

    get isAuthenticated() {
        return this.authService.isAuthenticated();
    }
}
