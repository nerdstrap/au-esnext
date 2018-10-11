import { inject, bindable, computedFrom } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { AureliaUX } from '@aurelia-ux/core';
import { AuthService } from 'aurelia-authentication';
import { Notification } from 'aurelia-notification';
import { I18N } from 'aurelia-i18n';
import { logger } from 'util/logger-helper';

@inject(Router, AureliaUX, AuthService, Notification, I18N)
export class App {

    languages = [
        { code: 'en', locale: 'en-US', flag: 'us' }
    ];

    constructor(router, ux, authService, notification, i18n) {
        this.router = router;
        this.ux = ux;
        this.ux.design.primary = '#2196F3';
        this.ux.design.accent = '#9E9E9E';
        this.authService = authService;
        this.notification = notification;
        this.i18n = i18n;

        let payload = authService.getTokenPayload();
        this.username = payload ? payload.username : null;
        this.authenticated = this.authService.isAuthenticated();
    }

    setLanguage(language) {
        localStorage.setItem('language', language.code);
        window.top.location.reload();
    }

    setLanguage(language) {
        localStorage.setItem('language', language.code);
        window.top.location.reload();
    }

    attached() {
        logger.info(this.i18n.tr('welcome_notification'));
        this.notification.info('welcome_notification');
    }
}
