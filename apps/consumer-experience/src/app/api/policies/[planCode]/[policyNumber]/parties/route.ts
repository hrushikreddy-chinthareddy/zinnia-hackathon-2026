import { NextRequest, NextResponse } from 'next/server';

import { getPolicyParties } from '@/services';
import { logTrace } from '@/utils/logging/log-fns';
import { buildNextReqLoggingContext } from '@/utils/logging/server-logging';

export async function GET(
  request: NextRequest,
  { params }: { params: { planCode: string; policyNumber: string } }
) {
  const loggingContext = await buildNextReqLoggingContext(request);
  logTrace('route-handler::policies::parties::GET::start', {
    ...loggingContext,
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  const { data, error } = await getPolicyParties(
    {
      planCode: params.planCode,
      policyNumber: params.policyNumber,
    },
    loggingContext
  );

  if (error || !data) {
    logTrace('route-handler::policies::parties::GET::error', {
      ...loggingContext,
      planCode: params.planCode,
      policyNumber: params.policyNumber,
      error,
    });
  }

  logTrace('route-handler::policies::parties::GET::complete', {
    ...loggingContext,
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  return NextResponse.json({
    data,
    error,
  });
}
