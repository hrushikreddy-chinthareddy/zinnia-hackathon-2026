'use server';

// import { PaymentForm } from '@zinnia/api-types/types/bpm';
import { OneTimePremiumTransaction } from '@zinnia/api-types/types/bpm';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

import { ApiEndpoints } from '@/components/dev-menu/types';
import { OttpState } from '@/components/providers/one-time-premium-payment/types';
import { ApiResponse, isMockErrorEnabled } from '@/services';
import { submitOneTimePremiumPayment } from '@/services/bpm';
import { ZAHARA_DATE_FORMAT } from '@/utils/dates';

// const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function submitOneTimePaymentAction(ottpData: {
  paymentDetails: OttpState;
  planCode: string;
  policyNumber: string;
}): Promise<ApiResponse<any>> {
  if (isMockErrorEnabled(ApiEndpoints.WITHDRAWAL_ELIGIBILITY)) {
    throw new Error('Error fetching withdrawal eligibility.');
  }

  const { policyNumber, planCode, paymentDetails } = ottpData;
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
      partyId: paymentDetails.payorBank?.appliesToPartyId,
      bankId: paymentDetails.payorBank?.bankId,
      paymentForm: OneTimePremiumTransaction.paymentForm.ACH,
    },
    // TODO: do we need to pass this?
    // reverseInitiator: false
  };

  try {
    const oneTimePayment = await submitOneTimePremiumPayment(
      { planCode, policyNumber },
      ottpRequest
    );

    return {
      // TODO: what should we actually return here?
      data: oneTimePayment,
      error: null,
    };
  } catch (e) {
    return {
      data: null,
      // TODO: add 500 vs 400 message?
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'submitOneTimePaymentAction Error',
      },
    };
  }
}
