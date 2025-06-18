import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { NextRequest, NextResponse } from 'next/server';

import {
  getAllSystematicPrograms,
  SystematicProgramResponse,
} from '@/services/policy/systematic-programs';
import { PolicyRequestInputs } from '@/types/policy';
import {
  buildNextReqLoggingContext,
  logTrace,
  logWarn,
} from '@/utils/logging/server-logging';

dayjs.extend(utc);

export async function GET(
  _request: NextRequest,
  { params }: { params: PolicyRequestInputs }
): Promise<NextResponse<SystematicProgramResponse>> {
  const loggingContext = await buildNextReqLoggingContext(_request);
  logTrace('policies::systematic-programs::POST::start', {
    ...loggingContext,
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  const { planCode, policyNumber } = params;

  try {
    const { data: systematicProgramData, error } =
      await getAllSystematicPrograms(
        { planCode, policyNumber },
        loggingContext
      );

    if (error || !systematicProgramData?.data) {
      throw new Error();
    }

    return NextResponse.json({
      data: systematicProgramData.data,
      error: null,
    });
  } catch (error) {
    logWarn('policies::systematic-programs::route::GET::error', {
      ...loggingContext,
      error,
    });

    return NextResponse.json({
      data: null,
      error: {
        status: 500,
        name: 'Failed to fetch systematic programs',
        message: 'Failed to fetch systematic programs',
      },
    });
  }
}
