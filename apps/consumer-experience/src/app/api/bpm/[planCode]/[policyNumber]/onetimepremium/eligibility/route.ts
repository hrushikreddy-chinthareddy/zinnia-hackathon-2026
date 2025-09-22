import { NextRequest, NextResponse } from 'next/server';

import { getPremiumEligibility } from '@/services/bpm';
import { logError, logTrace } from '@/utils/logging/log-fns';
import { buildNextReqLoggingContext } from '@/utils/logging/server-logging';

export async function GET(
  request: NextRequest,
  { params }: { params: { planCode: string; policyNumber: string } }
) {
  const loggingContext = await buildNextReqLoggingContext(request);

  logTrace('bpm::onetimepremium::eligibility::GET::start', {
    ...loggingContext,
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  try {
    const response = await getPremiumEligibility({
      planCode: params.planCode,
      policyNumber: params.policyNumber,
    });

    logTrace('bpm::onetimepremium::eligibility::GET::complete', {
      ...loggingContext,
      planCode: params.planCode,
      policyNumber: params.policyNumber,
    });

    return NextResponse.json({
      data: response.data,
      error: null,
    });
  } catch (error) {
    logError('bpm::onetimepremium::eligibility::GET::error', {
      ...loggingContext,
      planCode: params.planCode,
      policyNumber: params.policyNumber,
    });

    return NextResponse.json({
      data: null,
      error: {
        message: (error as Error).message,
        name: (error as Error).name,
        status: 500,
        correlationId: loggingContext.correlationId,
      },
    });
  }
}
