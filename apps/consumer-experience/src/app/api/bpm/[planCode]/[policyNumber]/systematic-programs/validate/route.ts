import {
  TransactionFailureResponse,
  TransactionResponse,
} from '@xd/api-types/dist/generated-types/bpm';
import { NextRequest, NextResponse } from 'next/server';

import { SystematicPremiumsState } from '@/components/providers/systematic-premiums/types';
import { ApiResponse } from '@/services';
import {
  getSystematicProgramValidation,
  SystematicProgramBPMResponse,
} from '@/services/bpm/systematic-programs';
import { systematicPremiumsStateToPolicyRequestInput } from '@/services/bpm/transformers';
import { PolicyRequestInputs } from '@/types/policy';
import { logError, logTrace } from '@/utils/logging/log-fns';
import { buildNextReqLoggingContext } from '@/utils/logging/server-logging';

export async function POST(
  _request: NextRequest,
  { params }: { params: PolicyRequestInputs }
): Promise<NextResponse<ApiResponse<SystematicProgramBPMResponse>>> {
  const loggingContext = await buildNextReqLoggingContext(_request);

  logTrace('bpm::systematic-program::POST::start', {
    ...loggingContext,
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  const { planCode, policyNumber } = params;

  const state: SystematicPremiumsState = await _request.json();

  const body = systematicPremiumsStateToPolicyRequestInput(
    state,
    loggingContext.correlationId
  );

  try {
    const response = await getSystematicProgramValidation(
      {
        planCode,
        policyNumber,
        arrangementId: state?.currentSystematicPremium?.arrangementId,
      },
      body,
      loggingContext
    );

    logTrace('bpm::systematic-program::POST::complete', {
      ...loggingContext,
      planCode,
      policyNumber,
    });

    // TODO: I feel like we should just return the same values regardless
    // of what gets sent to us through bpm
    if (response.data?.status === TransactionResponse.status.SUCCESS) {
      return NextResponse.json({
        data: {
          status: TransactionResponse.status.SUCCESS,
          quoteResponse: response.data.quoteResponse,
        },
        error: null,
      });
    }

    if (response.data?.status === TransactionFailureResponse.status.FAILURE) {
      return NextResponse.json({
        data: {
          status: TransactionResponse.status.FAILURE,
          validationResult: response.data.validationResult,
        },
        error: null,
      });
    }

    return NextResponse.json(response);
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
        name: 'error unknown',
        message: 'error unknown',
        status: 500,
      },
    });
  }
}
