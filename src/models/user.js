import { ChallengeQuestion } from './challenge-question';
import { ChallengeQuestionAnswer } from './challenge-question-answer';
import { EmailInfo } from './email-info';
import { SmsInfo } from './sms-info';
import { PhoneInfo } from './phone-info';


export class User {
    userId = 'userId';
    displayName = 'User Id';
    availableChallengeQuestions = [];
    challengeQuestionAnswers = [];
    emailInfos = [];
    phoneInfos = [];

    constructor() {
    }

    deserialize(json) {
        if (json) {
            this.userId = json.userId;
            this.displayName = json.displayName;

            if (json.challengeQuestions && json.challengeQuestions.length) {
                for (let i = 0; i < json.challengeQuestions.length; i++) {
                    let newChallengeQuestion = new ChallengeQuestion();
                    newChallengeQuestion.deserialize(json.challengeQuestions[i]);
                    this.challengeQuestions.push(newChallengeQuestion);
                }
            }

            if (json.challengeQuestionAnswers && json.challengeQuestionAnswers.length) {
                for (let i = 0; i < json.challengeQuestionAnswers.length; i++) {
                    let newChallengeQuestionAnswer = new ChallengeQuestionAnswer();
                    newChallengeQuestionAnswer.deserialize(json.challengeQuestionAnswers[i]);
                    this.challengeQuestionAnswers.push(newChallengeQuestionAnswer);
                }
            }

            if (json.emailInfos && json.emailInfos.length) {
                for (let i = 0; i < json.emailInfos.length; i++) {
                    let newEmailInfo = new EmailInfo();
                    newEmailInfo.deserialize(json.emailInfos[i]);
                    this.emailInfos.push(newEmailInfo);
                }
            }

            if (json.smsInfos && json.smsInfos.length) {
                for (let i = 0; i < json.smsInfos.length; i++) {
                    let newSmsInfo = new SmsInfo();
                    newSmsInfo.deserialize(json.smsInfos[i]);
                    this.smsInfos.push(newSmsInfo);
                }
            }

            if (json.phoneInfos && json.phoneInfos.length) {
                for (let i = 0; i < json.phoneInfos.length; i++) {
                    let newPhoneInfo = new PhoneInfo();
                    newPhoneInfo.deserialize(json.phoneInfos[i]);
                    this.phoneInfos.push(newPhoneInfo);
                }
            }
        }
    }
}
