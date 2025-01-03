import { isBpmError } from '@/services/bpm/types';
import { logError } from '@/utils/logging/server-logging';

export const returnErrorResponse = (e: unknown) => {
  if (isBpmError(e)) {
    logError('A BPM error has occurred', e);

    return {
      data: null,
      error: {
        cause: e.status,
        status: e.status === 'failure' ? 400 : 502,
        name: "Sorry, that didn't work",
        message: e.validationResult[0]?.error || '',
      },
    };
  }

  logError('A server error has occurred', e);
  return {
    data: null,
    error: {
      cause: (e as Response)?.statusText,
      status: (e as Response)?.status ?? 502,
      name: "Sorry, that didn't work.",
      message:
        (e as Response)?.status >= 500
          ? "Services are down, so we couldn't remove your address. Please try again later."
          : "We couldn't remove your address. Please try again later.",
    },
  };
};
