import { inject } from 'aurelia-framework';
import { bindable, customElement } from 'aurelia-templating';
import { StyleEngine } from '@aurelia-ux/core';
import { UxDrawerTheme } from './ux-drawer-theme';

@inject(Element, StyleEngine)
@customElement('ux-drawer')
export class UxDrawer {
    @bindable showBackdrop = true;
    @bindable dismissable = true;
    @bindable theme = null;
    @bindable position = null;
    @bindable type = null;
    element;
    styleEngine;

    constructor(element, styleEngine) {
        this.element = element;
        this.styleEngine = styleEngine;
    }

    bind() {
        if (this.theme !== null) {
            this.themeChanged(this.theme);
        }

        this.positionChanged(this.position);
    }

    close(event) {
        if (this.dismissable) {
            this.element.classList.remove('open');
        }
    }

    toggle() {
        if (this.element.classList.contains('open')) {
            this.element.classList.remove('open');
        } else {
            this.element.classList.add('open');
        }
    }

    themeChanged(newValue) {
        this.styleEngine.applyTheme(newValue, this.element);
    }

    positionChanged(newValue) {
        if (this.type !== 'temporary') {
            return;
        }

        this.element.classList.remove('right', 'left');

        if (newValue === 'right') {
            this.element.classList.add('right');
        } else {
            this.element.classList.add('left');
        }
    }
}
