import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid4 } from 'uuid';

import { Session } from '@/types/auth';
import { LoggingContext, UserInfo } from '@/types/logging';

import { getSession } from '../auth';
import pino from './pino-server';
import logger from './pino-server';

export enum LoggingModule {
  SERVER_HTTP_REQUEST = 'server-http',
  ENTERPRISE_API_TOKEN_HTTP = 'enterprise-api-token-http',
  PAGE = 'page',
}

export enum LoggingFn {
  FUNDS_PAGE = 'FundsPage',
  SELECT_AMOUNT_PAGE = 'SelectAmountPage',
}

export enum LoggingStage {
  START = 'start',
  COMPLETE = 'complete',
  ERROR = 'error',
}

type LoggingFunction = (
  message: string,
  serializableValues: Record<string, unknown>
) => void;

const getContextFromRequest = (req: NextRequest): Partial<LoggingContext> => {
  if (!req) {
    return {
      method: '',
      url: '',
      inputs: undefined,
      page: '',
      params: undefined,
      referrer: undefined,
    };
  }
  return {
    method: req.method || 'GET',
    url: req.url,
    params: req.nextUrl.searchParams,
    // TODO: scrub this of pii
    // inputs: req.body,
    referrer: req.headers.get('referer') || '',
  };
};

export const buildNextReqLoggingContext = async (
  req: NextRequest,
  res?: NextResponse
): Promise<CommonLogContext> => {
  return {
    ...getContextFromRequest(req),
    user: (await getUserInfoForLogging(res)) || {},
    correlationId: uuid4(),
  };
};

export interface CommonLogContext {
  user: UserInfo;
  correlationId: string;
}

export const buildCommonLogContext = async (
  currentLogContext?: CommonLogContext
): Promise<CommonLogContext> => {
  if (currentLogContext?.user && currentLogContext?.correlationId) {
    return currentLogContext;
  }

  return {
    user: (await getUserInfoForLogging()) || {},
    correlationId: uuid4(),
  };
};

export const logCompliance: LoggingFunction = (
  message,
  serializableValues = {}
) => {
  logger.info({ serializableValues, isCompliance: true }, message);
};

export const getUserInfoForLogging = async (
  res?: NextResponse
): Promise<UserInfo | undefined> => {
  try {
    const session = await getSession(res);
    return getUserInfoFromSession(session);
  } catch (error) {
    pino.warn('getUserInfoForLogging:: error', {
      // TODO: set this up
      // ...parseErrorInformation(error),
      file: 'utils/server-logging',
      function: 'getUserInfoForLogging',
      user: undefined,
    });
    return undefined;
  }
};

export const getUserInfoFromSession = (
  session: Session | null | undefined
): UserInfo => {
  return {
    partyId: session?.user?.partyId,
    sessionId: session?.user?.sid,
    userId: session?.user?.sub,
    email: session?.user?.email,
  };
};
