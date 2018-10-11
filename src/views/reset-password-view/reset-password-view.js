import { inject, bindable, computedFrom } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { EventAggregator } from 'aurelia-event-aggregator';
import { DialogService } from 'aurelia-dialog';
import { AuthService } from 'aurelia-authentication';
import { UserService } from 'services/user-service';
import { User } from 'models/user';
import { PublishPasswordStatusCodeEnum } from 'resources/enums/publish-password-status-code-enum';
import { logger } from 'util/logger-helper';


@inject(Router, EventAggregator, DialogService, AuthService, UserService)
export class ResetPasswordView {
    _model = {
        userId : 's123456',
        displayName : 'firstmlast'
    };
    _viewModel = 'view-models/confirm-new-password-view-model/confirm-new-password-view-model';
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
            this.eventAggregator.subscribe('go-to-confirm-new-password', message => this.onGoToConfirmNewPassword(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe('confirm-new-password', message => this.onConfirmNewPassword(message))
        );
        this.subscribers.push(
            this.eventAggregator.subscribe('publish-password-update', message => this.onPublishPasswordUpdate(message))
        );
    }

    detached() {
        _.each(this.subscribers, function (subscriber) {
            if (subscriber && subscriber.dispose) {
                subscriber.dispose();
            }
        });
    }

    activate(params, routeConfig) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    deactivate = () => {
        return new Promise(resolve => {
            resolve();
        });
    }

    onGoToConfirmNewPassword(message) {
        _viewModel = 'view-models/confirm-new-password-view-model/confirm-new-password-view-model';
    }

    onConfirmNewPassword(event) {
        return new Promise((resolve, reject) => {
            let request = {
                userId: this._model.userId,
                currentPassword: this._model.currentPassword,
                newPassword: this._model.newPassword,
                confirmNewPassword: this._model.confirmNewPassword
            };
            this.userService.confirmNewPassword(request)
                .then(response => {
                    this.confirmNewPasswordSuccess(response);
                    resolve(response);
                })
                .catch(reason => {
                    logger.error(reason);
                    this.eventAggregator.publish('confirm-new-password-error');
                    reject(reason);
                });
        });
    }

    confirmNewPasswordSuccess() {
        this._viewModel = 'view-models/publish-password-view-model/publish-password-view-model';
    }

    onPublishPasswordUpdate(message) {
        return new Promise((resolve, reject) => {
            let request = {
                userId: this._model.userId,
                remainingTime: message.remainingTime
            };
            this.userService.getPublishPasswordStatus(request)
                .then(response => {
                    this.getPublishPasswordStatusSuccess(response);
                    resolve(response);
                })
                .catch(reason => {
                    logger.error(reason);
                    this.eventAggregator.publish('publish-password-complete');
                    reject(reason);
                });
        });
    }

    getPublishPasswordStatusSuccess(response) {
        if (response) {
            if (response.statusCode === PublishPasswordStatusCodeEnum.Success.ordinal) {
                this.eventAggregator.publish('publish-password-complete');
                this.resetPasswordSuccess(response);
            }
        }
    }

    resetPasswordSuccess(message) {
        this.router.navigateToRoute('nexus');
    }
}
