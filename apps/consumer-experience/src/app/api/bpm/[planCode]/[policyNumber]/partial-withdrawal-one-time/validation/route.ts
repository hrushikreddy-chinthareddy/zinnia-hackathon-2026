import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { NextRequest, NextResponse } from 'next/server';

import { WithdrawalsState } from '@/components/stepped-workflow/workflows/withdrawals/provider/types';
import {
  getOneTimeWithdrawalValidation,
  WithdrawalValidationResponse,
} from '@/services/bpm/partial-withdrawal';
import { withdrawalStateToPolicyRequestInput } from '@/services/bpm/transformers';
import { PolicyRequestInputs } from '@/types/policy';
import { logTrace } from '@/utils/logging/log-fns';
import { buildNextReqLoggingContext } from '@/utils/logging/server-logging';

dayjs.extend(utc);

export async function POST(
  _request: NextRequest,
  { params }: { params: PolicyRequestInputs }
): Promise<NextResponse<WithdrawalValidationResponse>> {
  const loggingContext = await buildNextReqLoggingContext(_request);
  const { planCode, policyNumber } = params;

  logTrace('bpm::onetimepremium::POST::start', {
    ...loggingContext,
    planCode,
    policyNumber,
  });

  const state: WithdrawalsState = await _request.json();

  const paymentDetails = withdrawalStateToPolicyRequestInput(
    state,
    loggingContext.correlationId
  );

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

  return NextResponse.json(response);
}
