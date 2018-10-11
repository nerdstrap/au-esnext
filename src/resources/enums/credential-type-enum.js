import { Enum } from 'util/common-models';

export const CredentialTypeEnum = new Enum({
    Questions: { ordinal: 100, description: 'Questions' },
    Email: { ordinal: 200, description: 'Email' },
    Sms: { ordinal: 300, description: 'Sms' },
    Phone: { ordinal: 301, description: 'Phone' },
    Token: { ordinal: 500, description: 'Token' }
});
  