import { getSession } from './auth';
import { logTrace } from './logging/server-logging';

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

export const logApiNotOkDetails = async ({
  rawResponse,
  parsedResponse,
}: {
  rawResponse: Response;
  parsedResponse: unknown;
}) => {
  const sessionInfo = await userSessionForLogging();
  const { message } = parsedResponse as { message?: string };
  const { statusText, status, url } = rawResponse;

  return {
    apiMessage: message,
    statusText,
    statusCode: status,
    url,
    ...sessionInfo,
  };
};
