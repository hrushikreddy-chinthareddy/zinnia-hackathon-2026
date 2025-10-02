import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { NextRequest, NextResponse } from 'next/server';

import { WithdrawalsState } from '@/components/providers/withdrawals/types';
import {
  submitOneTimeWithdrawal,
  WithdrawalSubmissionResponse,
} from '@/services/bpm/partial-withdrawal';
import { PolicyRequestInputsParams } from '@/types/policy';
import { logTrace } from '@/utils/logging/log-fns';
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

  return NextResponse.json(response);
}
