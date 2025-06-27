type UserInfo = {
    partyId?: string;
    sessionId?: string;
    userId?: string;
    userName?: string;
};
export const getUserInfoForLogging = async (): Promise<UserInfo> => {
    return {
        partyId: 'session.user.partyId',
        sessionId: 'session.user.sid',
        userId: 'session.user.sub',
        userName: 'session.user.name',
    };
};

export const logCompliance = (message: string, serializableValues?: any) => {
    console.log(serializableValues, message);
};

export const logFatal = (message: string, serializableValues?: any) => {
    console.error(serializableValues, message);
};

export const logError = (message: string, serializableValues?: any) => {
    console.error(serializableValues, message);
};

export const logWarn = (message: string, serializableValues?: any) => {
    console.warn(serializableValues, message);
};

export const logInfo = (message: string, serializableValues?: any) => {
    console.log(serializableValues, message);
};

export const logTrace = (message: string, serializableValues?: any) => {
    console.info(serializableValues, message);
};

export const logDebug = (message: string, serializableValues?: any) => {
    console.debug(serializableValues, message);
};
