import { Container } from 'aurelia-dependency-injection';
import { StageComponent } from 'aurelia-testing';
import { bootstrap } from 'aurelia-bootstrapper';

import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { EventAggregator } from 'aurelia-event-aggregator';
import { DialogService } from 'aurelia-dialog';
import { AcknowledgementDialogViewModel } from 'view-models/acknowledgement-dialog-view-model/acknowledgement-dialog-view-model';
import { AuthService } from 'aurelia-authentication';
import { UserService } from 'services/user-service';
import { User } from 'models/user';
import { AuthStatusCodeEnum } from 'resources/enums/auth-status-code-enum';
import { CredentialTypeEnum } from 'resources/enums/credential-type-enum';
import { UnlockCredentialsStatusCodeEnum } from 'resources/enums/unlock-credentials-status-code-enum';
import { logger } from 'util/logger-helper';

import { LoginView } from 'views/login-view/login-view';

// mock components
let mockRouter = {
    navigateToRoute: () => {
        return true;
    },
};
let mockEventAggregator = {
    subscribe: () => {
        return true;
    },
    publish: () => {
        return true;
    }
};
let mockDialogService = {
    open: (response) => {
        return 0;
    }
};
let mockAuthService = {
    setResponseObject: (response) => {
        return 0;
    }
};

let mockAuthStatusCode = AuthStatusCodeEnum.Allow.ordinal;
let mockToken = '__token';
let mockSigninResponse = {
    authStatusCode: mockAuthStatusCode,
    token: mockToken
};
let mockSigninReason = new Error('reason');

let mockCredentialType = CredentialTypeEnum.Questions.ordinal;
let mockChallengeResponse = {
    userQuestions: []
};
let mockChallengeReason = new Error('reason');

let mockAuthenticateResponse = {
};
let mockAuthenticateReason = new Error('reason');

let mockUnlockCredentialsStatusCode = UnlockCredentialsStatusCodeEnum.Success.ordinal;
let mockGetUnlockCredentialsStatusResponse = {
    statusCode: mockUnlockCredentialsStatusCode
};
let mockGetUnlockCredentialsStatusReason = new Error('reason');

let mockUserService = {
    signin(request) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (request && request.userId === 'reject') {
                    reject(mockSigninReason);
                } else {
                    resolve(mockSigninResponse);
                }
            }, 5);
        });
    },
    challenge(request) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (request && request.userId === 'reject') {
                    reject(mockChallengeReason);
                } else {
                    resolve(mockChallengeResponse);
                }
            }, 5);
        });
    },
    authenticate(request) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (request && request.userId === 'reject') {
                    reject(mockAuthenticateReason);
                } else {
                    resolve(mockAuthenticateResponse);
                }
            }, 5);
        });
    },
    getUnlockCredentialsStatus(request) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (request && request.userId === 'reject') {
                    reject(mockGetUnlockCredentialsStatusReason);
                } else {
                    resolve(mockGetUnlockCredentialsStatusResponse);
                }
            }, 5);
        });
    }
};

// system under test
describe('the login-view class', () => {
    let sut;

    beforeEach(() => {
        spyOn(mockRouter, 'navigateToRoute').and.callThrough();
        spyOn(mockEventAggregator, 'subscribe').and.callThrough();
        spyOn(mockDialogService, 'open').and.callThrough();
        spyOn(mockAuthService, 'setResponseObject').and.callThrough();
        spyOn(mockUserService, 'signin').and.callThrough();
        spyOn(mockUserService, 'challenge').and.callThrough();
        spyOn(mockUserService, 'authenticate').and.callThrough();
        spyOn(mockUserService, 'getUnlockCredentialsStatus').and.callThrough();

        sut = new LoginView(mockRouter, mockEventAggregator, mockDialogService, mockAuthService, mockUserService);

        spyOn(sut, 'signinSuccess');
        spyOn(sut, 'getUnlockCredentialsStatusSuccess');
        spyOn(sut, 'loginSuccess');
    });

    it('constructor', done => {
        expect(sut).toBeDefined();
        expect(sut._model).toBeDefined();
        expect(sut.router).toBeDefined();
        expect(sut.eventAggregator).toBeDefined();
        expect(sut.dialogService).toBeDefined();
        expect(sut.authService).toBeDefined();
        expect(sut.userService).toBeDefined();
        expect(sut._model).toBeDefined();
        expect(sut._viewModel).toBeDefined();
        expect(sut.subscribers).toBeDefined();
        done();
    });

    describe('.attached', () => {

        it('should have subscribers', done => {
            sut.attached();
            expect(mockEventAggregator.subscribe).toHaveBeenCalledTimes(6);
            expect(sut.subscribers.length).toEqual(6);
            done();
        });

    });

    describe('.detached', () => {

        it('should not have subscribers', done => {
            sut.detached();
            expect(sut.subscribers.length).toEqual(0);
            done();
        });

    });

    describe('.onSignin', function () {

        it('should resolve', function (done) {
            let _userId = '_userId';
            let _credentials = '_credentials';
            sut._model.userId = _userId;
            sut._model.credentials = _credentials;
            let _signinPromiseRequest = {
                userId: sut._model.userId,
                credentials: sut._model.credentials
            };

            let _message = {};
            sut.onSignin(_message)
                .then(response => {
                    expect(mockUserService.signin).toHaveBeenCalledWith(_signinPromiseRequest);
                    expect(response).toBeDefined();
                    expect(response.token).toBeDefined();
                    expect(sut.signinSuccess).toHaveBeenCalledWith(response);
                    done();
                })
                .catch(reason => {
                    done();
                });
        });

        it('should reject', function (done) {
            let _userId = 'reject';
            let _credentials = '_credentials';
            sut._model.userId = _userId;
            sut._model.credentials = _credentials;
            let _signinPromiseRequest = {
                userId: sut._model.userId,
                credentials: sut._model.credentials
            };

            let _message = {};
            sut.onSignin(_message)
                .then(response => {
                    done();
                })
                .catch(reason => {
                    expect(mockUserService.signin).toHaveBeenCalledWith(_signinPromiseRequest);
                    expect(reason).toBeDefined();
                    done();
                });
        });
    });

    describe('.onChallenge', function () {

        it('should resolve', function (done) {
            let _userId = '_userId';
            let _challengeType = CredentialTypeEnum.Questions.ordinal;
            sut._model.userId = _userId;
            sut._model.selectedCredential = {
                credentialType: _challengeType
            };
            let _challengePromiseRequest = {
                userId: sut._model.userId,
                challengeType: sut._model.selectedCredential.credentialType
            };

            let _message = {};
            sut.onChallenge(_message)
                .then(response => {
                    expect(mockUserService.challenge).toHaveBeenCalledWith(_challengePromiseRequest);
                    expect(response).toBeDefined();
                    expect(response.userQuestions).toBeDefined();
                    expect(sut._viewModel).toBe('view-models/answer-questions-view-model/answer-questions-view-model');
                    done();
                })
                .catch(reason => {
                    done();
                });
        });

        it('should reject', function (done) {
            let _userId = 'reject';
            let _challengeType = '_challengeType';
            sut._model.userId = _userId;
            sut._model.selectedCredential = {
                credentialType: _challengeType
            };
            let _challengePromiseRequest = {
                userId: sut._model.userId,
                challengeType: sut._model.selectedCredential.credentialType
            };

            let _message = {};
            sut.onChallenge(_message)
                .then(response => {
                    done();
                })
                .catch(reason => {
                    expect(mockUserService.challenge).toHaveBeenCalledWith(_challengePromiseRequest);
                    expect(reason).toBeDefined();
                    done();
                });
        });
    });
    
    describe('.onAuthenticate', function () {

        it('should resolve', function (done) {
            let _userId = '_userId';
            let _credentials = '_credentials';
            sut._model.userId = _userId;
            let _authenticatePromiseRequest = {
                userId: sut._model.userId,
                credentials: _credentials
            };

            let _message = {
                credentials: _credentials
            };
            sut.onAuthenticate(_message)
                .then(response => {
                    expect(mockUserService.authenticate).toHaveBeenCalledWith(_authenticatePromiseRequest);
                    expect(response).toBeDefined();
                    expect(sut._viewModel).toBe('view-models/unlock-credentials-view-model/unlock-credentials-view-model');
                    done();
                })
                .catch(reason => {
                    done();
                });
        });

        it('should reject', function (done) {
            let _userId = 'reject';
            let _credentials = '_credentials';
            sut._model.userId = _userId;
            let _authenticatePromiseRequest = {
                userId: sut._model.userId,
                credentials: _credentials
            };

            let _message = {
                credentials: _credentials
            };
            sut.onAuthenticate(_message)
                .then(response => {
                    done();
                })
                .catch(reason => {
                    expect(mockUserService.authenticate).toHaveBeenCalledWith(_authenticatePromiseRequest);
                    expect(reason).toBeDefined();
                    done();
                });
        });
    });
    
    describe('.onUnlockCredentialsUpdate', function () {

        it('should resolve', function (done) {
            let _userId = '_userId';
            let _remainingTime = '_remainingTime';
            sut._model.userId = _userId;
            let _getUnlockCredentialsStatusPromiseRequest = {
                userId: sut._model.userId,
                remainingTime: _remainingTime
            };

            let _message = {
                remainingTime: _remainingTime
            };
            sut.onUnlockCredentialsUpdate(_message)
                .then(response => {
                    expect(mockUserService.getUnlockCredentialsStatus).toHaveBeenCalledWith(_getUnlockCredentialsStatusPromiseRequest);
                    expect(response).toBeDefined();
                    expect(sut.getUnlockCredentialsStatusSuccess).toHaveBeenCalledWith(response);
                    done();
                })
                .catch(reason => {
                    done();
                });
        });

        it('should reject', function (done) {
            let _userId = 'reject';
            let _remainingTime = '_remainingTime';
            sut._model.userId = _userId;
            let _getUnlockCredentialsStatusPromiseRequest = {
                userId: sut._model.userId,
                remainingTime: _remainingTime
            };

            let _message = {
                remainingTime: _remainingTime
            };
            sut.onUnlockCredentialsUpdate(_message)
                .then(response => {
                    done();
                })
                .catch(reason => {
                    expect(mockUserService.getUnlockCredentialsStatus).toHaveBeenCalledWith(_getUnlockCredentialsStatusPromiseRequest);
                    expect(reason).toBeDefined();
                    done();
                });
        });
    });

});
