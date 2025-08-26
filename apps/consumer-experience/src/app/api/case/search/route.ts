import { NextRequest, NextResponse } from 'next/server';

import { searchCasesByPolicyNumber } from '@/services/case';
import { logError, logTrace } from '@/utils/logging/log-fns';
import { buildNextReqLoggingContext } from '@/utils/logging/server-logging';

export async function POST(_request: NextRequest) {
  const loggingContext = await buildNextReqLoggingContext(_request);
  logTrace('case::search::POST::start', loggingContext);

  try {
    const { policyNumber, carrierCode } = await _request.json();
    const { data, error } = await searchCasesByPolicyNumber({
      policyNumber,
      carrierCode,
      loggingCtx: loggingContext,
    });

    logTrace('case::search::POST::complete', {
      ...loggingContext,
    });

    return NextResponse.json({
      data,
      error,
    });
  } catch (error) {
    logError('case::search::POST::error', {
      ...loggingContext,
      error,
    });
    throw error;
  }
}
