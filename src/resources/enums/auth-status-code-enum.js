import { Enum } from 'util/common-models';

export const AuthStatusCodeEnum = new Enum({
    Allow: { ordinal: 200, description: 'Allow' },
    Enroll: { ordinal: 201, description: 'Enroll' },
    Challenge: { ordinal: 202, description: 'Challenge' },
    Review: { ordinal: 203, description: 'Review' },
    Deny: { ordinal: 300, description: 'Deny' },
    Locked: { ordinal: 301, description: 'Locked' },
    Expired: { ordinal: 302, description: 'Expired' },
    NotAuthorized: { ordinal: 303, description: 'NotAuthorized' },
    None: { ordinal: 400, description: 'None' },
    DoesNotExist: { ordinal: 404, description: 'DoesNotExist' },
    Error: { ordinal: 500, description: 'Error' }
});
  