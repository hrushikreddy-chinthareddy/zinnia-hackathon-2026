import { NextRequest, NextResponse } from 'next/server';

import { getPolicyDetails } from '@/services';
import {
  buildNextReqLoggingContext,
  logTrace,
  logError,
} from '@/utils/logging/server-logging';

export async function GET(
  request: NextRequest,
  { params }: { params: { planCode: string; policyNumber: string } }
) {
  const loggingContext = await buildNextReqLoggingContext(request);
  logTrace('policies::details::GET::start', {
    ...loggingContext,
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  const { data, error } = await getPolicyDetails(
    {
      planCode: params.planCode,
      policyNumber: params.policyNumber,
    },
    loggingContext
  );

  if (error || !data) {
    logError('policies::details::GET::error', {
      ...loggingContext,
      planCode: params.planCode,
      policyNumber: params.policyNumber,
      error,
    });
    throw error;
  }

  logTrace('policies::details::GET::complete', {
    ...loggingContext,
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  return NextResponse.json({
    data,
    error,
  });
}
