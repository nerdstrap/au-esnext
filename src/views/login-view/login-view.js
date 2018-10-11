import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { EventAggregator } from 'aurelia-event-aggregator';
import { DialogService } from 'aurelia-dialog';
import { AcknowledgementDialogViewModel } from 'view-models/acknowledgement-dialog-view-model/acknowledgement-dialog-view-model';
import { AuthService } from 'aurelia-authentication';
import { UserService } from 'services/user-service';
import { AuthStatusCodeEnum } from 'resources/enums/auth-status-code-enum';
import { CredentialTypeEnum } from 'resources/enums/credential-type-enum';
import { UnlockCredentialsStatusCodeEnum } from 'resources/enums/unlock-credentials-status-code-enum';
import { logger } from 'util/logger-helper';

@inject(Router, EventAggregator, DialogService, AuthService, UserService)
export class LoginView {
    _model = {
    };
    _viewModel = 'view-models/network-credentials-view-model/network-credentials-view-model';
    subscribers = [];

    constructor(router, eventAggregator, dialogService, authService, userService) {
        this.router = router;
        this.eventAggregator = eventAggregator;
        this.dialogService = dialogService;
        this.authService = authService;
        this.userService = userService;
    }

    created(owningView, myView) {
        this.parentView = owningView.bindingContext;
    }

    attached() {
        this.subscribers.push(
            this.eventAggregator.subscribe('go-to-signin', message => this.onGoToSignin(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe('signin', message => this.onSignin(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe('challenge', message => this.onChallenge(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe('abandon-challenge', message => this.onAbandonChallenge(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe('authenticate', message => this.onAuthenticate(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe('unlock-credentials-update', message => this.onUnlockCredentialsUpdate(message))
        );
    }

    detached() {
        _.each(this.subscribers, function (subscriber) {
            if (subscriber && subscriber.dispose) {
                subscriber.dispose();
            }
        });
    }

    activate(params, routeConfig, navigationInstruction) {
        return new Promise(resolve => {
            if (params) {
                params = _.transform(params, function (result, val, key) {
                    result[key.toLowerCase()] = val;
                });
                if (params.returnurl) {
                    this.returnURL = params.returnurl;
                }
            }
            if (this.returnURL) {
                this.openRedirectDialog();
            }
            resolve();
        });
    }

    deactivate = () => {
        return new Promise(resolve => {
            resolve();
        });
    }

    openRedirectDialog() {
        let dialogModel = {
        };
        this.dialogService.open({ viewModel: AcknowledgementDialogViewModel, model: dialogModel, rejectOnCancel: false })
            .whenClosed(response => {
            })
            .catch(reason => {
                logger.error(reason);
            });
    }

    onGoToSignin(message) {
        this._viewModel = 'view-models/network-credentials-view-model/network-credentials-view-model';
    }

    onSignin(message) {
        return new Promise((resolve, reject) => {
            let request = {
                userId: this._model.userId,
                credentials: this._model.credentials
            };
            this.userService.signin(request)
                .then(response => {
                    this.signinSuccess(response);
                    resolve(response);
                })
                .catch(reason => {
                    logger.error(reason);
                    this.eventAggregator.publish('signin-error');
                    reject(reason);
                });
        });
    }

    signinSuccess(response) {
        if (response.authStatusCode === AuthStatusCodeEnum.Allow.ordinal) {
            this._model.token = response.token;
            this._viewModel = 'view-models/unlock-credentials-view-model/unlock-credentials-view-model';
        }
        else if (response.authStatusCode === AuthStatusCodeEnum.Challenge.ordinal) {
            this._model.preAuthToken = response.token;
            this._model.collectibleCredentials = response.collectibleCredentials;
            this._viewModel = 'view-models/collectible-credentials-view-model/collectible-credentials-view-model';
        }
        else if (response.authStatusCode === AuthStatusCodeEnum.Enroll.ordinal) {
            this._viewModel = 'view-models/unlock-credentials-view-model/unlock-credentials-view-model';
        }
        else if (response.authStatusCode === AuthStatusCodeEnum.Expired.ordinal) {
            this._viewModel = 'view-models/collectible-credentials-view-model/collectible-credentials-view-model';
        }
        else {
            this.eventAggregator.publish('signin-error');
        }
    }

    onAbandonChallenge(response) {
        this._viewModel = 'view-models/collectible-credentials-view-model/collectible-credentials-view-model';
    }

    onChallenge(message) {
        let request = {
            userId: this._model.userId,
            challengeType: this._model.selectedCredential.credentialType
        };
        return new Promise((resolve, reject) => {
            this.userService.challenge(request)
                .then(response => {
                    if (this._model.selectedCredential.credentialType === CredentialTypeEnum.Questions.ordinal) {
                        this._model.userQuestions = response.userQuestions;
                        this._viewModel = 'view-models/answer-questions-view-model/answer-questions-view-model';
                    } else if (this._model.selectedCredential.credentialType === CredentialTypeEnum.Email.ordinal) {
                        this._viewModel = 'view-models/verify-code-view-model/verify-code-view-model';
                    } else if (this._model.selectedCredential.credentialType === CredentialTypeEnum.Sms.ordinal) {
                        this._viewModel = 'view-models/verify-code-view-model/verify-code-view-model';
                    } else if (this._model.selectedCredential.credentialType === CredentialTypeEnum.Token.ordinal) {
                        this._viewModel = 'view-models/verify-code-view-model/verify-code-view-model';
                    }
                    resolve(response);
                })
                .catch(reason => {
                    logger.error(reason);
                    this.eventAggregator.publish('challenge-error');
                    reject(reason);
                });
        });
    }

    onAuthenticate(message) {
        return new Promise((resolve, reject) => {
            let request = {
                userId: this._model.userId,
                credentials: message.credentials
            };
            this.userService.authenticate(request)
                .then(response => {
                    this._model.token = response.token;
                    this._viewModel = 'view-models/unlock-credentials-view-model/unlock-credentials-view-model';
                    resolve(response);
                })
                .catch(reason => {
                    logger.error(reason);
                    this.eventAggregator.publish('authenticate-error');
                    reject(reason);
                });
        });
    }

    onUnlockCredentialsUpdate(message) {
        return new Promise((resolve, reject) => {
            let request = {
                userId: this._model.userId,
                remainingTime: message.remainingTime
            };
            this.userService.getUnlockCredentialsStatus(request)
                .then(response => {
                    this.getUnlockCredentialsStatusSuccess(response);
                    resolve(response);
                })
                .catch(reason => {
                    logger.error(reason);
                    this.eventAggregator.publish('unlock-credentials-complete');
                    reject(reason);
                });
        });
    }

    getUnlockCredentialsStatusSuccess(response) {
        if (response) {
            if (response.statusCode === UnlockCredentialsStatusCodeEnum.Success.ordinal) {
                this.eventAggregator.publish('unlock-credentials-complete');
                this.loginSuccess(response);
            }
        }
    }

    loginSuccess(message) {
        this.authService.setResponseObject(this._model.token);
        this.router.navigateToRoute('nexus');
    }
}
