import { datadogLogs } from '@datadog/browser-logs';
import { isNonProductionEnvironment } from './environment.helper';

export const browserLogError = (message: string, serializableValues: object = {}) => {
    isNonProductionEnvironment() && console.error(message, serializableValues);
    datadogLogs.logger.error(message, serializableValues);
};

export const browserLogWarn = (message: string, serializableValues: object = {}) => {
    isNonProductionEnvironment() && console.warn(message, serializableValues);
    datadogLogs.logger.warn(message, serializableValues);
};

export const browserLogInfo = (message: string, serializableValues: object = {}) => {
    isNonProductionEnvironment() && console.info(message, serializableValues);
    datadogLogs.logger.info(message, serializableValues);
};

export const browserLogDebug = (message: string, serializableValues: object = {}) => {
    isNonProductionEnvironment() && console.debug(message, serializableValues);
    datadogLogs.logger.debug(message, serializableValues);
};

export const browserLogTrace = (message: string, serializableValues: object = {}) => {
    isNonProductionEnvironment() && console.log(message, serializableValues);
    datadogLogs.logger.log(message, serializableValues);
};
