import { headers } from 'next/headers';
import { LogFn } from 'pino';

import pino from './pino-server';

type LoggingFunction = (
  message: string,
  serializableValues: Parameters<LogFn>[1]
) => void;

export const logFatal: LoggingFunction = (message, serializableValues = {}) => {
  const referrer = headers()?.get('referer');
  pino.fatal({ ...serializableValues, referrer }, message);
};

export const logError: LoggingFunction = (message, serializableValues = {}) => {
  const referrer = headers()?.get('referer');
  pino.error({ ...serializableValues, referrer }, message);
};

export const logWarn: LoggingFunction = (message, serializableValues = {}) => {
  const referrer = headers()?.get('referer');
  pino.warn({ ...serializableValues, referrer }, message);
};

export const logInfo: LoggingFunction = (message, serializableValues = {}) => {
  const referrer = headers()?.get('referer');
  pino.info({ ...serializableValues, referrer }, message);
};

export const logDebug: LoggingFunction = (message, serializableValues = {}) => {
  const referrer = headers()?.get('referer');
  pino.debug({ ...serializableValues, referrer }, message);
};

export const logTrace: LoggingFunction = (message, serializableValues = {}) => {
  const referrer = headers()?.get('referer');
  pino.trace({ ...serializableValues, referrer }, message);
};
