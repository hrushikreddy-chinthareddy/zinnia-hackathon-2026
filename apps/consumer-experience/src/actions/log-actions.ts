'use server';

import { logInfo } from '@/utils/logging/server-logging';

export const actionLogInfo = (message: string, serializableValues?: any) => {
  logInfo(message, serializableValues);
};
