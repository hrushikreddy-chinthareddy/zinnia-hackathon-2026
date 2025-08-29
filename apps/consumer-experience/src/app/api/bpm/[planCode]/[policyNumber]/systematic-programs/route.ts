import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { NextRequest, NextResponse } from 'next/server';

import { SystematicPremiumsState } from '@/components/providers/systematic-premiums/types';
import { ApiResponse } from '@/services';
import {
  submitSystematicProgram,
  SystematicProgramTransactionResponse,
} from '@/services/bpm/systematic-programs';
import { systematicPremiumsStateToPolicyRequestInput } from '@/services/bpm/transformers';
import { PolicyRequestInputsParams } from '@/types/policy';
import { logError, logTrace } from '@/utils/logging/log-fns';
import { buildNextReqLoggingContext } from '@/utils/logging/server-logging';

dayjs.extend(utc);

export async function POST(
  _request: NextRequest,
  { params }: PolicyRequestInputsParams
): Promise<NextResponse<ApiResponse<SystematicProgramTransactionResponse>>> {
  const loggingContext = await buildNextReqLoggingContext(_request);
  logTrace('bpm::systematic-program::POST::start', {
    ...loggingContext,
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  const { planCode, policyNumber } = params;

  const requestBody: SystematicPremiumsState = await _request.json();

  const paymentDetails = systematicPremiumsStateToPolicyRequestInput(
    requestBody,
    loggingContext.correlationId
  );

  try {
    const response = await submitSystematicProgram(
      { planCode, policyNumber },
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
        name: 'Error submitting systematic program',
        message: 'error submitting systematic program',
      },
    });
  }
}
