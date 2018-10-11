export class SmsInfo {
    phoneNumber = '';
    label = '';
    isDefault = false;

    constructor() {
    }

    deserialize(json) {
        if (json) {
            this.phoneNumber = json.phoneNumber;
            this.label = json.label;
            this.isDefault = Boolean(json.isDefault);
        }
    }
}
