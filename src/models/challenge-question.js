export class ChallengeQuestion {
    challengeQuestionId = '';
    challengeQuestionText = '';

    constructor() {
    }

    deserialize(json) {
        if (json) {
            this.challengeQuestionId = json.challengeQuestionId;
            this.challengeQuestionText = json.challengeQuestionText;
        }
    }
}
