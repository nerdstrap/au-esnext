import { inject, bindable, computedFrom } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { logger } from 'util/logger-helper';

@inject(Router)
export class SiteFooter {
    @bindable router = null;
    @bindable languages = null;

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

    setLanguage(event, language) {
        localStorage.setItem('language', language.code);
        logger.info('language_changed');
        window.top.location.reload();
    }
}
