import { inject, bindable, computedFrom } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { EventAggregator } from 'aurelia-event-aggregator';
import { ValidationControllerFactory, ValidationController, ValidationRules, validateTrigger } from 'aurelia-validation';
import { Notification } from 'aurelia-notification';
import { WindowHelper } from 'util/window-helper';
import appConfig from 'config/app';
import EventTimer from 'util/event-timer';
import { logger } from 'util/logger-helper';

@inject(Router, EventAggregator, ValidationControllerFactory, Notification, WindowHelper)
export class VerifyCodeViewModel {
    _model;
    verificationCodeHasFocus = true;
    onKeypressInputCallback;
    subscribers = [];
    tickTimeout = appConfig.login.challenge.tickTimeout || 1000;
    stopTimeout = appConfig.login.challenge.stopTimeout || 180000;

    constructor(router, eventAggregator, controllerFactory, notification, windowHelper) {
        this.router = router;
        this.eventAggregator = eventAggregator;
        this.controller = controllerFactory.createForCurrentScope();
        this.controller.validateTrigger = validateTrigger.manual;
        this.notification = notification;
        this.windowHelper = windowHelper;
        this.timer = new EventTimer(this.eventAggregator);

        this.onKeypressInputCallback = this.onKeypressInput.bind(this);
    }

    created(owningView, myView) {
        this.parentView = owningView.bindingContext;
    }

    attached() {
        this.subscribers.push(
            this.eventAggregator.subscribe('verify-code-tick', message => this.onEventTimerTick(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe('verify-code-stop', message => this.onEventTimerStop(message))
        );
    }

    detached() {
        _.each(this.subscribers, function (subscriber) {
            if (subscriber && subscriber.dispose) {
                subscriber.dispose();
            }
        });
    }

    activate(model) {
        return new Promise(resolve => {
            this._model = model;
            this.applyValidationRules();
            this.startTime = new Date();
            this.remainingTime = this.stopTimeout;
            this.timer.start(this.startTime, this.tickTimeout, 'verify-code-tick', this.stopTimeout, 'authenticate-error');
            this.windowHelper.addEventListener('keypress', this.onKeypressInputCallback, false);
            resolve();
        });
    }

    deactivate = () => {
        return new Promise(resolve => {
            this.timer.clear();
            this.windowHelper.removeEventListener('keypress', this.onKeypressInputCallback);
            resolve();
        });
    }

    applyValidationRules() {
        ValidationRules
            .ensure('verificationCode').required().minLength(8).maxLength(8)
            .on(this._model);
    }

    onKeypressInput(event) {
        if (typeof event !== 'undefined') {
            if (typeof event.target.id !== 'undefined') {
                if (event.target.id === 'verification-code-input') {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        this.authenticate(event);
                    }
                }
            }
        }
    }

    onEventTimerTick(message) {
        this.remainingTime -= this.tickTimeout;
    }

    onEventTimerStop(message) {
        this.timer.clear();
        this.notification.error('challenge_timeout_error');
        this.eventAggregator.publish('challenge-timeout');
    }

    authenticate(event) {
        return new Promise((resolve, reject) => {
            this.controller.validate()
                .then(result => {
                    if (result.valid) {
                        this.eventAggregator.publish('authenticate', { credentials: this._model.verificationCode });
                    }
                    resolve(result);
                })
                .catch(validateReason => {
                    logger.error(validateReason);
                    reject(validateReason);
                });
        });
    }

    onAuthenticateError() {
        this.notification.error('authenticate_error');
    }

    cancel(event) {
        this.timer.clear();
        this.notification.error('abandon_challenge_error');
        this.eventAggregator.publish('abandon-challenge');
    }

    resendCode(event) {
        this.eventAggregator.publish('resend-code');
    }
}
