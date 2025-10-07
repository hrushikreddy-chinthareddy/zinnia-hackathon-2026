import dayjs from 'dayjs';
import { NextRequest, NextResponse } from 'next/server';

import { getOneTimePremiumValidation } from '@/services/bpm/one-time-premium-payment';
import { PolicyRequestInputs } from '@/types/policy';
import { logTrace } from '@/utils/logging/log-fns';
import { buildNextReqLoggingContext } from '@/utils/logging/server-logging';

import { convertAggregationAccountTypeToPaymentForm } from '../utils';

export async function POST(
  _request: NextRequest,
  { params }: { params: PolicyRequestInputs }
) {
  const { planCode, policyNumber } = params;
  const loggingContext = await buildNextReqLoggingContext(_request);

  logTrace('bpm::onetimepremium::validation::POST::start', {
    ...loggingContext,
    planCode,
    policyNumber,
  });

  const paymentDetails = await _request.json();

  const ottpRequest = {
    caseId: '',
    correlationId: loggingContext.correlationId,
    effectiveDate: dayjs(paymentDetails.effectiveDate).utc().format(),
    transactionAmounts: {
      requestedAmount: paymentDetails.paymentAmount,
    },
    payor: {
      partyId: paymentDetails.partyId,
      bankId: paymentDetails.bankId,
      paymentForm: convertAggregationAccountTypeToPaymentForm(
        paymentDetails.paymentForm
      ),
    },
  };

  const response = await getOneTimePremiumValidation(
    { planCode, policyNumber },
    ottpRequest,
    loggingContext
  );

  logTrace('bpm::onetimepremium::validation::POST::complete', {
    ...loggingContext,
    planCode,
    policyNumber,
  });

  return NextResponse.json(response);
}
