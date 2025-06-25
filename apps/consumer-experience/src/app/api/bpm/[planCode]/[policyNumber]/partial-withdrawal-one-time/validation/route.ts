import {
  TransactionFailureResponse,
  TransactionResponse,
} from '@xd/api-types/dist/generated-types/bpm';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { NextRequest, NextResponse } from 'next/server';

import { WithdrawalsState } from '@/components/providers/withdrawals/types';
import {
  getOneTimeWithdrawalValidation,
  WithdrawalValidationResposne,
} from '@/services/bpm/partial-withdrawal';
import { withdrawalStateToPolicyRequestInput } from '@/services/bpm/transformers';
import { PolicyRequestInputs } from '@/types/policy';
import { logError, logTrace } from '@/utils/logging/log-fns';
import { buildNextReqLoggingContext } from '@/utils/logging/server-logging';

dayjs.extend(utc);

export async function POST(
  _request: NextRequest,
  { params }: { params: PolicyRequestInputs }
): Promise<NextResponse<WithdrawalValidationResposne>> {
  const loggingContext = await buildNextReqLoggingContext(_request);

  logTrace('bpm::onetimepremium::POST::start', {
    ...loggingContext,
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  const { planCode, policyNumber } = params;

  const state: WithdrawalsState = await _request.json();

  const paymentDetails = withdrawalStateToPolicyRequestInput(
    state,
    loggingContext.correlationId
  );

  try {
    const response = await getOneTimeWithdrawalValidation(
      { planCode, policyNumber },
      paymentDetails,
      loggingContext
    );

    logTrace('bpm::partial-withdrawal-one-time::POST::complete', {
      ...loggingContext,
      planCode,
      policyNumber,
    });

    if (response.data?.data?.status === TransactionResponse.status.SUCCESS) {
      return NextResponse.json({
        data: {
          status: TransactionResponse.status.SUCCESS,
          quoteResponse: response.data.data.quoteResponse,
        },
        error: null,
      });
    }

    if (
      response.data?.data?.status === TransactionFailureResponse.status.FAILURE
    ) {
      return NextResponse.json({
        data: {
          status: TransactionResponse.status.FAILURE,
          validationResult: response.data.data.validationResult,
        },
        error: null,
      });
    }

    throw new Error('Error fetching one time withdrawal validation');
  } catch (error) {
    logError('bpm::partial-withdrawal-one-time::validation::POST::error', {
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
