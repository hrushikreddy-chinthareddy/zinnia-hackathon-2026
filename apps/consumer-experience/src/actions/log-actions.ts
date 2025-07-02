'use server';

import { logInfo } from '@/utils/logging/log-fns';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const actionLogInfo = (message: string, serializableValues?: any) => {
  logInfo(message, serializableValues);
};
