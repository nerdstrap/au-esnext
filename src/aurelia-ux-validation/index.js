import { AureliaUXValidationRenderer } from './aurelia-ux-validation-renderer';

export function configure(config) {
    config.container.registerHandler(
        'aurelia-ux-form',
        container => container.get(AureliaUXValidationRenderer));
}
