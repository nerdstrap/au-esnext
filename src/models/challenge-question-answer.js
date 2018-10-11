export class ChallengeQuestionAnswer {
    challengeQuestionId = '';
    challengeQuestionText = '';
    userAnswerText = '';

    constructor() {
    }

    deserialize(json) {
        if (json) {
            this.challengeQuestionId = json.challengeQuestionId;
            this.challengeQuestionText = json.challengeQuestionText;
            this.userAnswerText = json.userAnswerText;
        }
    }
}
