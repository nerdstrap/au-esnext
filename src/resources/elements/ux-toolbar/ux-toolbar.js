import { inject } from 'aurelia-framework';
import { bindable, customElement } from 'aurelia-templating';
import { EventAggregator } from 'aurelia-event-aggregator';
import { StyleEngine } from '@aurelia-ux/core';
import { UxToolbarTheme } from './ux-toolbar-theme';
import _ from 'lodash';

@inject(Element, EventAggregator, StyleEngine)
@customElement('ux-toolbar')
export class UxToolbar {
    @bindable theme = null;
    isNavigating = false;
    subscribers = [];

    constructor(element, eventAggregator, styleEngine) {
        this.element = element;
        this.eventAggregator = eventAggregator;
        this.styleEngine = styleEngine;
    }

    bind() {
        this.themeChanged(this.theme);
    }

    attached() {
        this.subscribers.push(
            this.eventAggregator.subscribe('router:navigation:processing', message => this.onNavigationProcessing(message))
        );

        this.subscribers.push(
            this.eventAggregator.subscribe('router:navigation:complete', message => this.onNavigationComplete(message))
        );
    }

    detached() {
        _.each(this.subscribers, function (subscriber) {
            if (subscriber && subscriber.dispose) {
                subscriber.dispose();
            }
        });
    }

    themeChanged(newValue) {
        if (newValue !== null && newValue.themeKey === null) {
            newValue.themeKey = 'alert';
        }

        this.styleEngine.applyTheme(newValue, this.element);
    }

    onNavigationProcessing(message) {
        this.isNavigating = true;
    }

    onNavigationComplete(message) {
        this.isNavigating = false;
    }
}
