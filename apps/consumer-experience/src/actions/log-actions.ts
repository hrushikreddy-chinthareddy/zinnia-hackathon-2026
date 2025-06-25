'use server';

import { logInfo } from '@/utils/logging/log-fns';

export const actionLogInfo = (message: string, serializableValues?: any) => {
  logInfo(message, serializableValues);
};
