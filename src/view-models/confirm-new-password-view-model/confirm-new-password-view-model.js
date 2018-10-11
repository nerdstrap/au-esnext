import { inject, bindable, computedFrom } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { EventAggregator } from 'aurelia-event-aggregator';
import { ValidationControllerFactory, ValidationController, ValidationRules, validateTrigger } from 'aurelia-validation';
import { Notification } from 'aurelia-notification';
import { WindowHelper } from 'util/window-helper';
import appConfig from 'config/app';
import { logger } from 'util/logger-helper';

@inject(Router, EventAggregator, ValidationControllerFactory, Notification, WindowHelper)
export class ConfirmNewPasswordViewModel {
    _model;
    currentPasswordHasFocus = true;
    newPasswordHasFocus = false;
    confirmNewPasswordHasFocus = false;
    onKeypressInputCallback;
    subscribers = [];
    minLength = appConfig.resetPassword.minLength || 8;
    minLengthLegacy = appConfig.resetPassword.minLengthLegacy || 1;
    maxLength = appConfig.resetPassword.maxLength || 30;
    maxLengthLegacy = appConfig.resetPassword.maxLengthLegacy || 100;

    constructor(router, eventAggregator, controllerFactory, notification, windowHelper) {
        this.router = router;
        this.eventAggregator = eventAggregator;
        this.controller = controllerFactory.createForCurrentScope();
        this.controller.validateTrigger = validateTrigger.manual;
        this.notification = notification;
        this.windowHelper = windowHelper;

        this.onKeypressInputCallback = this.onKeypressInput.bind(this);
    }

    created(owningView, myView) {
        this.parentView = owningView.bindingContext;
    }

    attached() {
        this.subscribers.push(
            this.eventAggregator.subscribe('confirm-new-password-error', message => this.onConfirmNewPasswordError(message))
        );
    }

    detached() {
        _.each(this.subscribers, function (subscriber) {
            if (subscriber && subscriber.dispose) {
                subscriber.dispose();
            }
        });
    }

    activate(model) {
        return new Promise((resolve) => {
            this._model = model;
            this.applyValidationRules();
            this.windowHelper.addEventListener('keypress', this.onKeypressInputCallback, false);
            resolve();
        });
    }

    deactivate = () => {
        return new Promise(resolve => {
            this.windowHelper.removeEventListener('keypress', this.onKeypressInputCallback);
            resolve();
        });
    }

    validateMatchesStartsWithAlpha(newPassword) {
        return /^[a-zA-Z]/.test(newPassword);
    }

    validateMatchesDoesNotContainIllegal(newPassword) {
        return !/([^a-zA-Z0-9\.+|&!*\-%_\?\:\=])/.test(newPassword);
    }

    validateMatchesContainsLowercaseAlpha(newPassword) {
        return /[a-z]/.test(newPassword);
    }

    validateMatchesContainsUppercaseAlpha(newPassword) {
        return /[A-Z]/.test(newPassword);
    }

    validateMatchesContainsTwoSpecial(newPassword) {
        return /(((?=(.*\d){2})^.*)|(?=(.*[\.+|&!*\-%_\?\:\=]){2})^.*)|((.*\d)(.*[\.+|&!*\-%_\?\:\=]))|((.*[\.+|&!*\-%_\?\:\=])(.*\d))/.test(newPassword);
    }

    validateMatchesDoesNotEndWithSpecial(newPassword) {
        var isValidPassword = true;
        var checkForEndsWithSpecialCharacter = new RegExp(/[\.+|&!*\-%_\?\:\=]$/);
        if (checkForEndsWithSpecialCharacter.test(newPassword)) {
            isValidPassword = false;
            return isValidPassword;
        }
        return isValidPassword;
    }

    validateMatchesDoesNotRepeatThree(newPassword) {
        return !/([a-zA-Z0-9])\1{2,}/.test(newPassword);
    }

    validateMatchesDoesNotContainUserId(newPassword, userId) {
        let userIdRegexp = new RegExp(userId, 'i');
        return !userIdRegexp.test(newPassword);
    }

    validateMatchesDoesNotContainDisplayName(newPassword, displayName) {
        var isValidPassword = true;
        for (let i = 0; i < displayName.length - 2; i++) {
            let fragment = displayName.substring(i, i + 3);
            let rx = new RegExp(fragment, 'i');
            if (rx.test(newPassword)) {
                isValidPassword = false;
                return isValidPassword;
            }
        }
        return isValidPassword;
    }

    applyValidationRules() {
        ValidationRules.customRule(
            'matchesStartsWithAlpha',
            (value, obj) => value === null || value === undefined || this.validateMatchesStartsWithAlpha(value)
        );
        ValidationRules.customRule(
            'matchesDoesNotContainIllegal',
            (value, obj) => value === null || value === undefined || this.validateMatchesDoesNotContainIllegal(value)
        );
        ValidationRules.customRule(
            'matchesContainsLowercaseAlpha',
            (value, obj) => value === null || value === undefined || this.validateMatchesContainsLowercaseAlpha(value)
        );
        ValidationRules.customRule(
            'matchesContainsUppercaseAlpha',
            (value, obj) => value === null || value === undefined || this.validateMatchesContainsUppercaseAlpha(value)
        );
        ValidationRules.customRule(
            'matchesContainsTwoSpecial',
            (value, obj) => value === null || value === undefined || this.validateMatchesContainsTwoSpecial(value)
        );
        ValidationRules.customRule(
            'matchesDoesNotEndWithSpecial',
            (value, obj) => value === null || value === undefined || this.validateMatchesDoesNotEndWithSpecial(value)
        );
        ValidationRules.customRule(
            'matchesDoesNotRepeatThree',
            (value, obj) => value === null || value === undefined || this.validateMatchesDoesNotRepeatThree(value)
        );
        ValidationRules.customRule(
            'matchesDoesNotContainUserId',
            (value, obj, otherPropertyName) =>
                value === null
                || value === undefined
                || value === ''
                || obj[otherPropertyName] === null
                || obj[otherPropertyName] === undefined
                || obj[otherPropertyName] === ''
                || this.validateMatchesDoesNotContainUserId(value, obj[otherPropertyName]),
            'matchesDoesNotContainUserId',
            otherPropertyName => ({ otherPropertyName })
        );
        ValidationRules.customRule(
            'matchesDoesNotContainDisplayName',
            (value, obj, otherPropertyName) =>
                value === null
                || value === undefined
                || value === ''
                || obj[otherPropertyName] === null
                || obj[otherPropertyName] === undefined
                || obj[otherPropertyName] === ''
                || this.validateMatchesDoesNotContainDisplayName(value, obj[otherPropertyName]),
            'matchesDoesNotContainDisplayName',
            otherPropertyName => ({ otherPropertyName })
        );
        ValidationRules.customRule(
            'matchesOtherProperty',
            (value, obj, otherPropertyName) =>
                value === null
                || value === undefined
                || value === ''
                || obj[otherPropertyName] === null
                || obj[otherPropertyName] === undefined
                || obj[otherPropertyName] === ''
                || value === obj[otherPropertyName],
            'matchesOtherProperty',
            otherPropertyName => ({ otherPropertyName })
        );

        ValidationRules
            .ensure('currentPassword')
            .required()
            .minLength(this.minLengthLegacy)
            .maxLength(this.maxLengthLegacy)
            .ensure('newPassword')
            .required()
            .minLength(this.minLength)
            .maxLength(this.maxLength)
            .then()
            .satisfiesRule('matchesStartsWithAlpha')
            .satisfiesRule('matchesDoesNotContainIllegal')
            .satisfiesRule('matchesContainsLowercaseAlpha')
            .satisfiesRule('matchesContainsUppercaseAlpha')
            .satisfiesRule('matchesContainsTwoSpecial')
            .satisfiesRule('matchesDoesNotEndWithSpecial')
            .satisfiesRule('matchesDoesNotRepeatThree')
            .satisfiesRule('matchesDoesNotContainUserId', 'userId')
            .satisfiesRule('matchesDoesNotContainDisplayName', 'displayName')
            .ensure('confirmNewPassword')
            .required()
            .satisfiesRule('matchesOtherProperty', 'newPassword')
            .on(this._model);
    }

    onKeypressInput(event) {
        if (typeof event !== 'undefined') {
            if (typeof event.target.id !== 'undefined') {
                if (event.target.id === 'confirm-new-password-input') {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        this.confirmNewPassword(event);
                    }
                }
            }
        }
    }

    confirmNewPassword(event) {
        return new Promise((resolve, reject) => {
            this.controller.validate()
                .then(result => {
                    if (result.valid) {
                        this.eventAggregator.publish('confirm-new-password');
                    }
                    resolve();
                })
                .catch(reason => {
                    logger.error(reason);
                    reject();
                });
        });
    }

    onConfirmNewPasswordError() {
        this.controller.addError('', this._model, 'confirmNewPassword');
        this.notification.error('confirm_new_password_error');
    }

    cancel(event) {
        this.router.navigateToRoute('nexus');
    }
}
