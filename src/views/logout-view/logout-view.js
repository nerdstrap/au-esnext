import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { EventAggregator } from 'aurelia-event-aggregator';
import { DialogService } from 'aurelia-dialog';
import { AuthService } from 'aurelia-authentication';
import { logger } from 'util/logger-helper';

@inject(Router, EventAggregator, DialogService, AuthService)
export class LogoutView {

    constructor(router, eventAggregator, dialogService, authService) {
        this.router = router;
        this.eventAggregator = eventAggregator;
        this.dialogService = dialogService;
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
            this.dialogService.closeAll();
            this.authService.logout();
            resolve();
        });
    }

    deactivate = () => {
        return new Promise(resolve => {
            resolve();
        });
    }
}
