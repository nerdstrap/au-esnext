export function configure(config) {
    config.globalResources([
        "./value-converters/date-formatter",
        "./value-converters/phone-formatter",
        "./value-converters/timer-formatter",
        './elements/ux-drawer/ux-drawer',
        './elements/ux-tabs/ux-tabs',
        './elements/ux-toolbar/ux-toolbar'
    ]);
}
