import { logTrace } from '@/utils/logging/log-fns';

import { getSession } from './auth';

export const userSessionForLogging = async () => {
  const session = await getSession();

  return {
    sessionId: session?.user?.sid,
    userId: session?.user?.sub,
  };
};

export const parseAPIResponse = async (response: Response) => {
  try {
    return await response.json();
  } catch (error) {
    logTrace('Error parsing response', { error, url: response.url });
    return {};
  }
};

interface ApiNotOkDetails {
  apiMessage?: string;
  statusText: string;
  status: number;
  url: string;
}

export const logApiNotOkDetails = async ({
  rawResponse,
  parsedResponse,
}: {
  rawResponse: Response;
  parsedResponse: unknown;
}): Promise<ApiNotOkDetails> => {
  const { message } = parsedResponse as { message?: string };
  const { statusText, status, url } = rawResponse;

  return {
    apiMessage: message,
    statusText,
    status,
    url,
  };
};
