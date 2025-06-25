import { NextRequest, NextResponse } from 'next/server';

import { getPolicyStatusDetails } from '@/services';
import { logError, logTrace } from '@/utils/logging/log-fns';
import { buildNextReqLoggingContext } from '@/utils/logging/server-logging';

export async function GET(
  request: NextRequest,
  { params }: { params: { planCode: string; policyNumber: string } }
) {
  const loggingContext = await buildNextReqLoggingContext(request);
  logTrace('policies::status::GET::start', {
    ...loggingContext,
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  try {
    const { data, error } = await getPolicyStatusDetails(
      {
        planCode: params.planCode,
        policyNumber: params.policyNumber,
      },
      loggingContext
    );

    logTrace('policies::status::GET::complete', {
      ...loggingContext,
      planCode: params.planCode,
      policyNumber: params.policyNumber,
    });

    return NextResponse.json({
      data,
      error,
    });
  } catch (error) {
    logError('policies::status::GET::error', {
      ...loggingContext,
      planCode: params.planCode,
      policyNumber: params.policyNumber,
      error,
    });
    throw error;
  }
}
