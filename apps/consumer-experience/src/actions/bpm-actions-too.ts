'use server';

import {
  OneTimePremiumRequest,
  PaymentForm,
} from '@zinnia/api-types/types/bpm';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

import { ApiEndpoints } from '@/components/dev-menu/types';
import { OttpState } from '@/components/providers/one-time-premium-payment/types';
import { bpmApiBaseUrl, isMockErrorEnabled, ServerApi } from '@/services';
import { parseAPIResponse } from '@/utils/api';
import { ZAHARA_DATE_FORMAT } from '@/utils/dates';

// const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function submitOneTimePaymentAction(ottpData: {
  paymentDetails: OttpState;
  planCode: string;
  policyNumber: string;
}): Promise<any> {
  console.log('here');
  // try {
  //   await delay(5000);
  //   console.log('hellow');
  //   throw new Error('error');
  // } catch (error) {
  //   console.log(error);
  //   return {
  //     success: false,
  //     message: 'uh oh',
  //   };
  // }

  try {
    if (isMockErrorEnabled(ApiEndpoints.WITHDRAWAL_ELIGIBILITY)) {
      throw new Error('Error fetching withdrawal eligibility.');
    }

    const { policyNumber, planCode, paymentDetails } = ottpData;
    const ottpRequest = {
      // TODO: do we need to check for current caseId?
      caseId: '',
      // TODO: add this to logging
      correlationId: uuidv4(),
      // TODO: format to zahara date
      effectiveDate: dayjs(paymentDetails.effectiveDate).format(
        ZAHARA_DATE_FORMAT
      ),
      transactionAmounts: {
        requestedAmount: paymentDetails.paymentAmount,
      },
      payor: {
        partyId: paymentDetails.payorBank?.appliesToPartyId,
        bankId: paymentDetails.payorBank?.bankId,
        paymentForm: PaymentForm.ACH,
      },
      // TODO: do we need to pass this?
      // reverseInitiator: false
    };

    console.log('REQUEST', ottpRequest);
    const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/onetimepremium`;

    const rawResponse = await ServerApi.post(url, JSON.stringify(ottpRequest), {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!rawResponse?.ok) {
      throw new Error('Something went wrong', {
        cause: rawResponse.status,
      });
    }

    const response = await parseAPIResponse(rawResponse);
    console.log(response);
    return {
      data: true,
      error: null,
    };
  } catch (e) {
    console.log(e);
    return {
      data: null,
      // TODO: add 500 vs 400 message?
      error: 'Something went wrong',
    };
  }
}
