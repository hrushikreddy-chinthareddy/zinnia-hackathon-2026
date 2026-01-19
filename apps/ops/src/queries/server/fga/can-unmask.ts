// DEPU-3724 - temporarily return to allowing all users to see PII for case, documents, call logs, and notes
// TODO: remove this and insert logic that won't fail due to rate limits

import { isDev } from '@deps/utils/environment.helpers';

const canUnmaskPii = async (
    accessToken: string | undefined,
    partyId: string | undefined,
    loggingContext?: object
) => {
    if (isDev()) {
        console.log('canUnmaskPii', accessToken, partyId, loggingContext);
    }
    return true;
};

export default canUnmaskPii;
