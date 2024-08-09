import { OneTimePremiumTransaction } from '@zinnia/api-types/types/bpm';
import dayjs from 'dayjs';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { submitOneTimePremiumPayment } from '@/services/bpm';
import { PolicyRequestInputs } from '@/types/policy';
import { ZAHARA_DATE_FORMAT } from '@/utils/dates';

export async function POST(
  _request: NextRequest,
  { params }: { params: PolicyRequestInputs }
) {
  const { planCode, policyNumber } = params;
  const paymentDetails = await _request.json();

  // TODO: should this go here or into the function that calls it?
  const ottpRequest = {
    // TODO: do we need to check for current caseId?
    caseId: '',
    // TODO: add this to logging
    correlationId: uuidv4(),
    effectiveDate: dayjs(paymentDetails.effectiveDate).format(
      ZAHARA_DATE_FORMAT
    ),
    transactionAmounts: {
      requestedAmount: paymentDetails.paymentAmount,
    },
    payor: {
      partyId: paymentDetails.partyId,
      bankId: paymentDetails.bankId,
      paymentForm: OneTimePremiumTransaction.paymentForm.ACH,
    },
    // TODO: do we need to pass this?
    // reverseInitiator: false
  };

  try {
    const response = await submitOneTimePremiumPayment(
      { planCode, policyNumber },
      ottpRequest
    );
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ data: null, error: (error as Error).cause });
  }
}
