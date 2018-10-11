import { inject, bindable, computedFrom } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { EventAggregator } from 'aurelia-event-aggregator';
import { ValidationControllerFactory, ValidationController, ValidationRules, validateTrigger } from 'aurelia-validation';
import { Notification } from 'aurelia-notification';
import { WindowHelper } from 'util/window-helper';
import { logger } from 'util/logger-helper';

@inject(Router, EventAggregator, ValidationControllerFactory, Notification, WindowHelper)
export class NetworkCredentialsViewModel {
    _model;
    userIdHasFocus = true;
    credentialsHasFocus = false;
    showCredentials = false;
    onKeypressInputCallback;
    formIsSubmitting = false;
    subscribers = [];

    constructor(router, eventAggregator, controllerFactory, notification, windowHelper) {
        this.router = router;
        this.eventAggregator = eventAggregator;
        this.controller = controllerFactory.createForCurrentScope();
        this.controller.validateTrigger = validateTrigger.manual;
        this.notification = notification;
        this.windowHelper = windowHelper;

        this.onKeypressInputCallback = this.onKeypressInput.bind(this);
    }

    created(owningView, myView) {
        this.parentView = owningView.bindingContext;
    }

    attached() {
        this.subscribers.push(
            this.eventAggregator.subscribe('signin-error', message => this.onSigninError(message))
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

    applyValidationRules() {
        ValidationRules
            .ensure('userId').required().minLength(1).maxLength(256)
            .ensure('credentials').required().minLength(1).maxLength(256)
            .on(this._model);
    }

    onKeypressInput(event) {
        if (typeof event !== 'undefined') {
            if (typeof event.target.id !== 'undefined') {
                if (event.target.id === 'credentials-input') {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        this.signin(event);
                    }
                }
            }
        }
    }

    signin(event) {
        return new Promise((resolve, reject) => {
            this.formIsSubmitting = true;
            this.controller.validate()
                .then(result => {
                    if (result.valid) {
                        this.eventAggregator.publish('signin');
                    }
                    resolve(result);
                })
                .catch(reason => {
                    logger.error(reason);
                    this.formIsSubmitting = false;
                    reject(reason);
                });
        });
    }

    onSigninError() {
        this.formIsSubmitting = false;
        this.controller.addError('', this._model, 'userId');
        this.controller.addError('', this._model, 'credentials');
        this.notification.error('signin_error_notification');
    }

    goToTroubleSigningIn(event) {
        this.eventAggregator.publish('go-to-trouble-signing-in');
    }
}
