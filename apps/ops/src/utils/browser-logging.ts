import { datadogLogs } from '@datadog/browser-logs';

export const browserLogError = (message: string, serializableValues: object = {}) => {
    datadogLogs.logger.error(message, serializableValues);
};

export const browserLogWarn = (message: string, serializableValues: object = {}) => {
    datadogLogs.logger.warn(message, serializableValues);
};

export const browserLogInfo = (message: string, serializableValues: object = {}) => {
    datadogLogs.logger.info(message, serializableValues);
};

export const browserLogDebug = (message: string, serializableValues: object = {}) => {
    datadogLogs.logger.debug(message, serializableValues);
};

export const browserLogTrace = (message: string, serializableValues: object = {}) => {
    datadogLogs.logger.log(message, serializableValues);
};
