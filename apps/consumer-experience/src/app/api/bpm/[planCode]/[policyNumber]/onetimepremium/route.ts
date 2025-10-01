import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { NextRequest, NextResponse } from 'next/server';

import { submitOneTimePremiumPayment } from '@/services/bpm/one-time-premium-payment';
import { PolicyRequestInputs } from '@/types/policy';
import { logError, logTrace } from '@/utils/logging/log-fns';
import { buildNextReqLoggingContext } from '@/utils/logging/server-logging';

import { convertAggregationAccountTypeToPaymentForm } from './utils';

dayjs.extend(utc);

export async function POST(
  _request: NextRequest,
  { params }: { params: PolicyRequestInputs }
) {
  const loggingContext = await buildNextReqLoggingContext(_request);
  logTrace('bpm::onetimepremium::POST::start', {
    ...loggingContext,
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  const { planCode, policyNumber } = params;

  const paymentDetails = await _request.json();

  // TODO: should this go here or into the function that calls it?
  const ottpRequest = {
    // TODO: do we need to check for current caseId?
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
    // TODO: do we need to pass this?
    // reverseInitiator: false
  };

  try {
    const response = await submitOneTimePremiumPayment(
      { planCode, policyNumber },
      ottpRequest,
      loggingContext
    );

    logTrace('bpm::onetimepremium::POST::complete', {
      ...loggingContext,
      planCode,
      policyNumber,
    });

    return NextResponse.json(response);
  } catch (error) {
    logError('bpm::onetimepremium::POST::error', {
      ...loggingContext,
      planCode: params.planCode,
      policyNumber: params.policyNumber,
      error,
    });
    return NextResponse.json({
      data: null,
      error: (error as Error).cause,
      correlationId: loggingContext.correlationId,
    });
  }
}
