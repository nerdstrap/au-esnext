import { Enum } from 'util/common-models';

export const UnlockCredentialsStatusCodeEnum = new Enum({
    Init: { ordinal: 100, description: 'Init' },
    Success: { ordinal: 200, description: 'Success' },
    Error: { ordinal: 300, description: 'Error' }
});
  