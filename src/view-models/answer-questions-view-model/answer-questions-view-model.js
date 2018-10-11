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
export class AnswerQuestionsViewModel {
    _model;
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
            this.eventAggregator.subscribe('answer-questions-tick', message => this.onEventTimerTick(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe('answer-questions-stop', message => this.onEventTimerStop(message))
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
            this.timer.start(this.startTime, this.tickTimeout, 'answer-questions-tick', this.stopTimeout, 'answer-questions-stop');
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
        for (let i = 0; i < this._model.userQuestions.length; i++) {
            let userQuestion = this._model.userQuestions[i];
            if (userQuestion) {
                ValidationRules
                    .ensure('userAnswer').required()
                    .on(userQuestion);
            }
        }
    }

    onKeypressInput(event) {
        if (typeof event !== 'undefined') {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.authenticate(event);
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
            let credentials = this.serializeCredentials();
            this.controller.validate()
                .then(result => {
                    if (result.valid) {
                        this.eventAggregator.publish('authenticate', { credentials: credentials });
                    }
                    resolve(result);
                })
                .catch(reason => {
                    logger.error(reason);
                    reject(reason);
                });
        });
    }

    onAuthenticateError() {
        this.notification.error('authenticate_error');
    }

    serializeCredentials() {
        let credentials = _.map(this._model.userQuestions, function (userQuestion) { return userQuestion.questionId + '|' + userQuestion.userAnswer; }).join(',');
        return credentials;
    }

    cancel(event) {
        this.timer.clear();
        this.notification.error('abandon_challenge_error');
        this.eventAggregator.publish('abandon-challenge');
    }
}
