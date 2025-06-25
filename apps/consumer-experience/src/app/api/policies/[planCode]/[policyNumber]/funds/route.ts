import { NextRequest, NextResponse } from 'next/server';

import { getFunds } from '@/services/funds';
import { logError, logTrace } from '@/utils/logging/log-fns';
import { buildNextReqLoggingContext } from '@/utils/logging/server-logging';

export async function GET(
  _request: NextRequest,
  { params }: { params: { planCode: string; policyNumber: string } }
) {
  const loggingContext = await buildNextReqLoggingContext(_request);
  logTrace('policies::funds::GET::start', {
    ...loggingContext,
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  try {
    const { data, error } = await getFunds(
      {
        planCode: params.planCode,
        policyNumber: params.policyNumber,
      },
      loggingContext
    );

    logTrace('policies::funds::GET::complete', {
      ...loggingContext,
      planCode: params.planCode,
      policyNumber: params.policyNumber,
    });

    return NextResponse.json({
      data,
      error,
    });
  } catch (error) {
    logError('policies::funds::GET::error', {
      ...loggingContext,
      planCode: params.planCode,
      policyNumber: params.policyNumber,
      error,
    });
    throw error;
  }
}
