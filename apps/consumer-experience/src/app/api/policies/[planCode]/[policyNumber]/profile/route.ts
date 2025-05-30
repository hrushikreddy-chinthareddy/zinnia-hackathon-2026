import { NextRequest, NextResponse } from 'next/server';

import { getPolicyProfileData } from '@/services';
import {
  buildNextReqLoggingContext,
  logError,
  logTrace,
} from '@/utils/logging/server-logging';

export async function GET(
  _request: NextRequest,
  { params }: { params: { planCode: string; policyNumber: string } }
) {
  const loggingContext = await buildNextReqLoggingContext(_request);

  logTrace('policies::profile::GET::start', {
    ...loggingContext,
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  const { data, error } = await getPolicyProfileData(
    {
      planCode: params.planCode,
      policyNumber: params.policyNumber,
    },
    loggingContext
  );

  if (error || !data) {
    logError('policies::profile::GET::error', {
      ...loggingContext,
      planCode: params.planCode,
      policyNumber: params.policyNumber,
      error,
    });
    throw error;
  }

  logTrace('policies::profile::GET::complete', {
    ...loggingContext,
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  return NextResponse.json({
    data,
    error,
  });
}
