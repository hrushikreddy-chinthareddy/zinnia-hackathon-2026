import { SystematicProgram } from '@xd/api-types/dist/generated-types/sor';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { NextRequest, NextResponse } from 'next/server';

import { ApiResponse } from '@/services';
import { getAllSystematicPrograms } from '@/services/policy/systematic-programs';
import { PolicyRequestInputs } from '@/types/policy';
import { logError, logTrace } from '@/utils/logging/log-fns';
import { buildNextReqLoggingContext } from '@/utils/logging/server-logging';

dayjs.extend(utc);

export async function GET(
  _request: NextRequest,
  {
    params,
  }: {
    params: PolicyRequestInputs & {
      systematicProgramId: string;
    };
  }
): Promise<NextResponse<ApiResponse<SystematicProgram>>> {
  const loggingContext = await buildNextReqLoggingContext(_request);
  logTrace('policies::systematic-programs::search::GET::start', {
    ...loggingContext,
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  const { planCode, policyNumber, systematicProgramId } = params;

  try {
    const { data: systematicProgramData, error } =
      await getAllSystematicPrograms(
        { planCode, policyNumber },
        loggingContext
      );

    if (error || !systematicProgramData?.data) {
      throw new Error();
    }

    const program = systematicProgramData.data.find(
      (program: SystematicProgram) =>
        program.arrangementId === systematicProgramId
    );

    if (!program) {
      throw new Error();
    }

    return NextResponse.json({
      data: program,
      error: null,
    });
  } catch (error) {
    logError('policies::systematic-programs::search::GET::error', {
      ...loggingContext,
      error,
    });

    return NextResponse.json({
      data: null,
      error: {
        status: 500,
        name: 'policies::systematic-programs::search::GET::error',
        message: 'Failed to fetch systematic programs',
        correlationId: loggingContext.correlationId,
      },
    });
  }
}
