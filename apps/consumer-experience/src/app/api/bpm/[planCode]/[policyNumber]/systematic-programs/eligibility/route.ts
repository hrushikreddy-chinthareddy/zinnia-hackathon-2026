import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { NextRequest, NextResponse } from 'next/server';

import {
  getAddSystematicProgramEligibility,
  TransactionEligbilityResponse,
} from '@/services/bpm/systematic-programs';
import { PolicyRequestInputs } from '@/types/policy';
import { logError, logTrace } from '@/utils/logging/log-fns';
import { buildNextReqLoggingContext } from '@/utils/logging/server-logging';
import { UniformServiceResponse } from '@/utils/serverClientUtils';
dayjs.extend(utc);

export async function GET(
  _request: NextRequest,
  { params }: { params: PolicyRequestInputs }
): Promise<
  NextResponse<UniformServiceResponse<TransactionEligbilityResponse>>
> {
  const loggingContext = await buildNextReqLoggingContext(_request);
  logTrace('policies::systematic-programs::eligibility::GET::start', {
    ...loggingContext,
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  const { planCode, policyNumber } = params;

  try {
    const { data: systematicProgramData, error } =
      await getAddSystematicProgramEligibility(
        { planCode, policyNumber },
        loggingContext
      );

    if (error || !systematicProgramData?.status) {
      throw new Error();
    }

    return NextResponse.json({
      data: systematicProgramData,
      error: null,
    });
  } catch (error) {
    logError('policies::systematic-programs::eligibility::POST::error', {
      ...loggingContext,
      error,
    });

    return NextResponse.json({
      data: null,
      error: {
        status: 500,
        name: 'policies::systematic-programs::eligibility::POST::error',
        message:
          (error as Error).message ||
          'Something went wrong getting the eligibility',
        correlationId: loggingContext.correlationId,
      },
    });
  }
}
