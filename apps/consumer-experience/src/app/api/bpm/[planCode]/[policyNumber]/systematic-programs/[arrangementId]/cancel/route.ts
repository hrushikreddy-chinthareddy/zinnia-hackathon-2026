import { SystematicProgramUpdateRequest } from '@xd/api-types/dist/generated-types/bpm';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { NextRequest, NextResponse } from 'next/server';

import { ApiResponse } from '@/services';
import {
  cancelSystematicProgram,
  SystematicProgramTransactionResponse,
} from '@/services/bpm/systematic-programs';
import { logError, logTrace } from '@/utils/logging/log-fns';
import { buildNextReqLoggingContext } from '@/utils/logging/server-logging';

dayjs.extend(utc);

export async function POST(
  _request: NextRequest,
  {
    params,
  }: {
    params: {
      arrangementId: string;
      planCode: string;
      policyNumber: string;
    };
  }
): Promise<NextResponse<ApiResponse<SystematicProgramTransactionResponse>>> {
  const loggingContext = await buildNextReqLoggingContext(_request);
  logTrace('bpm::systematic-program::cancel::POST::start', {
    ...loggingContext,
    planCode: params.planCode,
    policyNumber: params.policyNumber,
    arrangementId: params.arrangementId,
  });

  const { planCode, policyNumber, arrangementId } = params;

  const paymentDetails: SystematicProgramUpdateRequest = await _request.json();

  try {
    const response = await cancelSystematicProgram(
      { arrangementId, planCode, policyNumber },
      paymentDetails,
      loggingContext
    );

    logTrace('bpm::systematic-program::POST::complete', {
      ...loggingContext,
      planCode,
      policyNumber,
    });

    const data = response?.data;

    if (!!data && 'caseId' in data) {
      return NextResponse.json({
        data: {
          caseId: data.caseId,
          caseStatus: data.caseStatus,
          correlationId: data.correlationId,
        },
        error: null,
      });
    }

    throw new Error('Error submitting systematic premium');
  } catch (error) {
    logError('bpm::systematic-program::validation::POST::error', {
      ...loggingContext,
      planCode,
      policyNumber,
      error,
    });

    return NextResponse.json({
      data: null,
      error: {
        status: 500,
        name: 'Error fetching systematic program validation',
        message: 'error fetching systematic program validation',
      },
    });
  }
}
