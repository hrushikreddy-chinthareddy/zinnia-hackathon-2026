// DEPU-3724 - temporarily return to allowing all users to see PII for case, documents, call logs, and notes
// TODO: remove this and insert logic that won't fail due to rate limits
const canUnmaskPii = async (accessToken: string | undefined, partyId: string | undefined, loggingContext?: object) => {
    return true;
};

export default canUnmaskPii;
