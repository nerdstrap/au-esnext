export default {
    app: {
        title: 'Corporation Name - Application Name',
        environment: 'development',
    },
    logger: {
        name: 'au-esnext'
    },
    i18n: {
        debug: true
    },
    'aurelia-api': {
        endpoints: [
            {
                name: 'user',
                endpoint: 'http://127.0.0.1:1337/user/',
                default: true
            },
            {
                name: 'auth',
                endpoint: 'http://127.0.0.1:1337/'
            }
        ],
    },
    defaultLocale: {
        language: 'en',
        locale: 'en-US'
    },
    'aurelia-notification': {
        defaults: {
            timeout: 5000,
            clickToClose: true
        },
        notifications: {
            success: 'humane-flatty-success',
            error: 'humane-flatty-error',
            info: 'humane-flatty-info'
        }
    },
    login: {
        challenge: {
            tickTimeout: 1000,
            stopTimeout: 7000
        },
        unlock: {
            tickTimeout: 1000,
            stopTimeout: 180000
        }
    },
    resetPassword: {
        minLength: 8,
        minLengthLegacy: 1,
        maxLength: 30,
        maxLengthLegacy: 100
    },
    publishPassword: {
        tickTimeout: 1000,
        stopTimeout: 180000
    }
};
