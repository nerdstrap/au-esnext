import { inject, bindable, computedFrom } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { EventAggregator } from 'aurelia-event-aggregator';
import { ValidationControllerFactory, ValidationController, ValidationRules, validateTrigger } from 'aurelia-validation';
import { Notification } from 'aurelia-notification';
import { WindowHelper } from 'util/window-helper';
import { logger } from 'util/logger-helper';

@inject(Router, EventAggregator, ValidationControllerFactory, Notification, WindowHelper)
export class CollectibleCredentialsViewModel {
    _model;
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
            this.eventAggregator.subscribe('challenge-error', message => this.onChallengeError(message))
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
            this._model.selectedCredential = 0;
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
            .ensure('selectedCredential').required()
            .on(this._model);
    }

    onKeypressInput(event) {
        if (typeof event !== 'undefined') {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.challenge(event);
            }
        }
    }

    challenge(event) {
        return new Promise((resolve, reject) => {
            this.formIsSubmitting = true;
            this.controller.validate()
                .then(result => {
                    if (result.valid) {
                        this.eventAggregator.publish('challenge');
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

    onChallengeError() {
        this.formIsSubmitting = false;
        this.notification.error('challenge_error');
    }

    cancel(event) {
        this.eventAggregator.publish('go-to-signin');
    }
}
