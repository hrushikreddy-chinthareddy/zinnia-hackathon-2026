import { NextRequest, NextResponse } from 'next/server';

import { getUpcomingPremium } from '@/services';
import { PolicyRequestInputsParams } from '@/types/policy';
import { logError, logTrace } from '@/utils/logging/log-fns';
import { buildNextReqLoggingContext } from '@/utils/logging/server-logging';

export async function GET(
  request: NextRequest,
  { params }: PolicyRequestInputsParams
) {
  const loggingContext = await buildNextReqLoggingContext(request);
  logTrace('policies::premiums::GET::start', {
    ...loggingContext,
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  try {
    const { data, error } = await getUpcomingPremium(
      {
        planCode: params.planCode,
        policyNumber: params.policyNumber,
      },
      loggingContext
    );

    if (error || !data) {
      throw new Error();
    }
    logTrace('policies::premiums::GET::complete', {
      ...loggingContext,
      planCode: params.planCode,
      policyNumber: params.policyNumber,
    });
    return NextResponse.json({
      data,
      error: null,
    });
  } catch (error) {
    logError('policies::premiums::GET::error', {
      ...loggingContext,
      planCode: params.planCode,
      policyNumber: params.policyNumber,
      error,
    });
    return NextResponse.json({
      data: null,
      error: {
        name: 'policies::premiums::GET::error',
        message: 'Failed to get premiums',
        correlationId: loggingContext.correlationId,
      },
    });
  }
}
