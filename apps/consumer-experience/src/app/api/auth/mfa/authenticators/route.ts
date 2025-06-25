import { NextRequest, NextResponse } from 'next/server';

import { ServerApi } from '@/services';
import { getMfaCookie } from '@/utils/auth';
import { logError, logTrace, logWarn } from '@/utils/logging/log-fns';
import { buildNextReqLoggingContext } from '@/utils/logging/server-logging';

export async function GET(req: NextRequest) {
  const loggingContext = buildNextReqLoggingContext(req);
  logTrace('mfa::authenticators::GET::start', loggingContext);

  try {
    const headers = req.headers.get('authorization');
    const token = headers?.split(' ')[1] ?? (await getMfaCookie());

    if (!token) {
      logWarn('mfa::authenticators::GET::no-token', loggingContext);
      return NextResponse.json(
        {
          error: 'No token provided',
        },
        {
          status: 400,
        }
      );
    }

    const response = await ServerApi.getMfaAuthenticators(token);

    if (response.ok) {
      const data = await response.json();
      logTrace('mfa::authenticators::GET::complete', {
        ...loggingContext,
      });
      return NextResponse.json(data);
    }

    return NextResponse.json(
      {
        error: response.statusText,
      },
      {
        status: response.status,
      }
    );
  } catch (error) {
    logError('mfa::authenticators::GET::error', {
      ...loggingContext,
      error,
    });
    throw error;
  }
}
