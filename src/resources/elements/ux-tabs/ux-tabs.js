import { inject } from 'aurelia-framework';
import { bindable, customElement } from 'aurelia-templating';
import { UxComponent, StyleEngine } from '@aurelia-ux/core';
import { UxTabsTheme } from './ux-tabs-theme';

@inject(Element, StyleEngine)
@customElement('ux-tabs')
export class UxTooltip {
    @bindable for = null;
    @bindable theme = null;
    element;
    styleEngine;

    constructor(element, styleEngine) {
        this.element = element;
        this.styleEngine = styleEngine;
    }

    bind() {
        this.themeChanged(this.theme);
    }

    themeChanged(newValue) {
        if (newValue !== null && newValue.themeKey === null) {
            newValue.themeKey = 'alert';
        }

        this.styleEngine.applyTheme(newValue, this.element);
    }
}
