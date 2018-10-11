export class EmailInfo {
    emailAddress = '';
    label = '';
    isDefault = false;

    constructor() {
    }

    deserialize(json) {
        if (json) {
            this.emailAddress = json.emailAddress;
            this.label = json.label;
            this.isDefault = Boolean(json.isDefault);
        }
    }
}
