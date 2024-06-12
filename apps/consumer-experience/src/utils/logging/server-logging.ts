import { Session } from '@/types/auth';

import pino from './pino-server';

type LoggingFunction = (message: string, serializableValues: any) => void;

export const getUserInfoFromSession = (session: Session | null | undefined) => {
  return {
    partyId: session?.user?.partyId,
    sessionId: session?.user?.sid,
    userId: session?.user?.sub,
  };
};

export const logCompliance: LoggingFunction = (
  message,
  serializableValues = {}
) => {
  pino.compliance({ serializableValues, isCompliance: true }, message);
};

export const logFatal: LoggingFunction = (message, serializableValues = {}) => {
  pino.fatal(serializableValues, message);
};

export const logError: LoggingFunction = (message, serializableValues = {}) => {
  pino.error(serializableValues, message);
};

export const logWarn: LoggingFunction = (message, serializableValues = {}) => {
  pino.warn(serializableValues, message);
};

export const logInfo: LoggingFunction = (message, serializableValues = {}) => {
  pino.info(serializableValues, message);
};

export const logDebug: LoggingFunction = (message, serializableValues = {}) => {
  pino.debug(serializableValues, message);
};

export const logTrace: LoggingFunction = (message, serializableValues = {}) => {
  pino.trace(serializableValues, message);
};
