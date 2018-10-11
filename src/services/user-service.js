import { inject, bindable, computedFrom } from 'aurelia-framework';
import { Config } from 'aurelia-api';
import { logger } from 'util/logger-helper';

const _token = {
    id_token: '__id_token',
    access_token: '__access_token',
    refresh_token: '__refresh_token'
};

const _userQuestions = [
    {
        questionId: 1,
        questionText: 'Question 1?',
        userAnswer: ''
    }, {
        questionId: 2,
        questionText: 'Question 2?',
        userAnswer: ''
    }, {
        questionId: 3,
        questionText: 'Question 3?',
        userAnswer: ''
    }, {
        questionId: 4,
        questionText: 'Question 4?',
        userAnswer: ''
    }, {
        questionId: 5,
        questionText: 'Question 5?',
        userAnswer: ''
    }
];

const _collectibleCredentials = [
    {
        credentialType: 100,
        id: 'questions',
        description: 'questions'
    }, {
        credentialType: 200,
        id: 'email321',
        description: 'xxxxxxx@gmail.com'
    }, {
        credentialType: 200,
        id: 'email987',
        description: 'xxxxxxx@corp.com'
    }, {
        credentialType: 200,
        id: 'email654',
        description: 'xxxxxxx@live.com'
    }, {
        credentialType: 300,
        id: 'sms321',
        description: 'xxx-xxx-x321'
    }, {
        credentialType: 300,
        id: 'sms987',
        description: 'xxx-xxx-x987'
    }, {
        credentialType: 300,
        id: 'sms654',
        description: 'xxx-xxx-x654'
    }, {
        credentialType: 500,
        id: 'securid',
        description: 'securid'
    }
];

const _unlockCredentialsLogItems = [];
const _publishPasswordLogItems = [];

@inject(Config)
export class UserService {
    isRequesting = false;

    constructor(config) {
        this.userEndpoint = config.getEndpoint('user');
        this.userEndpoint.client.interceptors.push({
            request: function (request) {
                logger.info(`Requesting ${request.method} ${request.url}`);
                this.isRequesting = true;
                return request;
            },
            requestError: function (error, request) {
                logger.info(`Error ${error}`);
                this.isRequesting = false;
                return error;
            },
            response: function (response, request) {
                logger.info(`Received ${response.status} ${response.url}`);
                this.isRequesting = false;
                return response;
            },
            responseError: function (error, request) {
                logger.info(`Error ${error}`);
                this.isRequesting = false;
                if (error) {
                    if (/failed to fetch/i.test(error.message)) {
                        return new Error(error.message);
                    }
                }
            }
        });
    }

    signin(request) {
        return new Promise(resolve => {
            setTimeout(() => {
                let response;
                if (request.userId === 'challenge') {
                    response = JSON.parse(JSON.stringify({
                        authStatusCode: 202,
                        collectibleCredentials: _collectibleCredentials
                    }));
                } else if (request.userId === 'enroll') {
                    response = JSON.parse(JSON.stringify({
                        authStatusCode: 201
                    }));
                } else if (request.userId === 'deny') {
                    response = JSON.parse(JSON.stringify({
                        authStatusCode: 300
                    }));
                } else if (request.userId === 'error') {
                    response = JSON.parse(JSON.stringify({
                        authStatusCode: 500
                    }));
                } else {
                    response = JSON.parse(JSON.stringify({
                        authStatusCode: 200,
                        token: _token
                    }));
                }
                resolve(response);
            }, 5000);
        });
    }

    challenge(request) {
        return new Promise(resolve => {
            setTimeout(() => {
                let response = JSON.parse(JSON.stringify({
                    statusCode: 200,
                    userQuestions: _userQuestions
                }));
                resolve(response);
            }, 5000);
        });
    }

    authenticate(request) {
        return new Promise(resolve => {
            setTimeout(() => {
                let response = JSON.parse(JSON.stringify({
                    authStatusCode: 200,
                    token: _token
                }));
                resolve(response);
            }, 5000);
        });
    }

    confirmNewPassword(request) {
        return new Promise(resolve => {
            setTimeout(() => {
                let response = JSON.parse(JSON.stringify({
                    statusCode: 200
                }));
                resolve(response);
            }, 5000);
        });
    }

    getUnlockCredentialsStatus(request) {
        return new Promise(resolve => {
            setTimeout(() => {
                let _statusCode = 100;
                if (request.remainingTime < 150000) {
                    _statusCode = 200;
                }
                let response = JSON.parse(JSON.stringify({
                    statusCode: _statusCode,
                    logItems: _unlockCredentialsLogItems
                }));
                resolve(response);
            }, 300);
        });
    }

    getPublishPasswordStatus(request) {
        return new Promise(resolve => {
            setTimeout(() => {
                let _statusCode = 100;
                if (request.remainingTime < 150000) {
                    _statusCode = 200;
                }
                let response = JSON.parse(JSON.stringify({
                    statusCode: _statusCode,
                    logItems: _publishPasswordLogItems
                }));
                resolve(response);
            }, 300);
        });
    }
}
