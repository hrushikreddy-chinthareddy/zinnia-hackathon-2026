import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { NextRequest, NextResponse } from 'next/server';

import { WithdrawalsState } from '@/components/providers/withdrawals/types';
import {
  submitOneTimeWithdrawal,
  WithdrawalSubmissionResponse,
} from '@/services/bpm/partial-withdrawal';
import { PolicyRequestInputsParams } from '@/types/policy';
import { logError, logTrace } from '@/utils/logging/log-fns';
import { buildNextReqLoggingContext } from '@/utils/logging/server-logging';

dayjs.extend(utc);

export async function POST(
  _request: NextRequest,
  { params }: PolicyRequestInputsParams
): Promise<NextResponse<WithdrawalSubmissionResponse>> {
  const loggingContext = await buildNextReqLoggingContext(_request);
  logTrace('bpm::onetimepremium::POST::start', {
    ...loggingContext,
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  const { planCode, policyNumber } = params;

  const paymentDetails: WithdrawalsState = await _request.json();

  try {
    const response = await submitOneTimeWithdrawal(
      { planCode, policyNumber },
      paymentDetails,
      loggingContext
    );

    logTrace('bpm::partial-withdrawal-one-time::POST::complete', {
      ...loggingContext,
      planCode,
      policyNumber,
    });

    if (response.data?.data?.caseId?.length) {
      return NextResponse.json({
        status: 202,
        data: response.data.data,
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
        status: 500,
        name: 'Error fetching one time withdrawal validation',
        message: 'error fetching one time withdrawal validation',
        correlationId: loggingContext.correlationId,
      },
    });
  }
}
