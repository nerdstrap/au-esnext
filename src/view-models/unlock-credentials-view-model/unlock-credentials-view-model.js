import { inject, bindable, computedFrom } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { EventAggregator } from 'aurelia-event-aggregator';
import { WindowHelper } from 'util/window-helper';
import appConfig from 'config/app';
import EventTimer from 'util/event-timer';
import { logger } from 'util/logger-helper';

@inject(Router, EventAggregator, WindowHelper)
export class UnlockCredentialsViewModel {
    _model;
    subscribers = [];
    tickTimeout = appConfig.login.unlock.tickTimeout || 1000;
    stopTimeout = appConfig.login.unlock.stopTimeout || 180000;

    constructor(router, eventAggregator, windowHelper) {
        this.router = router;
        this.eventAggregator = eventAggregator;
        this.windowHelper = windowHelper;
        this.timer = new EventTimer(this.eventAggregator);
    }

    created(owningView, myView) {
        this.parentView = owningView.bindingContext;
    }

    attached() {
        this.subscribers.push(
            this.eventAggregator.subscribe('unlock-credentials-tick', message => this.onEventTimerTick(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe('unlock-credentials-stop', message => this.onEventTimerStop(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe('unlock-credentials-complete', message => this.onUnlockCredentialsComplete(message))
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
            this.startTime = new Date();
            this.remainingTime = this.stopTimeout;
            this.timer.start(this.startTime, this.tickTimeout, 'unlock-credentials-tick', this.stopTimeout, 'unlock-credentials-stop');
            resolve();
        });
    }

    deactivate = () => {
        return new Promise(resolve => {
            this.timer.clear();
            resolve();
        });
    }

    onEventTimerTick(message) {
        this.remainingTime -= this.tickTimeout;
        this.eventAggregator.publish('unlock-credentials-update', { remainingTime: this.remainingTime });
    }

    onEventTimerStop(message) {
        this.timer.clear();
        this.eventAggregator.publish('unlock-credentials-timeout');
    }

    onUnlockCredentialsComplete(message) {
        this.timer.clear();
    }
}
