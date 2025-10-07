import {
  OneTimePremiumRequest,
  PaymentForm,
  TransactionFailureResponse,
  TransactionResponse,
} from '@xd/api-types/dist/generated-types/bpm';

import { ApiEndpoints } from '@/components/dev-menu/types';
import { isMockErrorEnabled, transactionsAPIUrl } from '@/services/api-config';
import { ServerApi } from '@/services/server-http';
import { PolicyRequestInputs } from '@/types/policy';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { logError } from '@/utils/logging/log-fns';
import { CommonLogContext } from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';

import { transformEligibility } from '../transformers';

const FILE_NAME = '/src/services/bpm/one-time-premium-payment/index.ts';

type OneTimePremiumBPMSucessResponse = {
  status: TransactionResponse.status.SUCCESS;
} & TransactionResponse;

type OneTimePremiumBPMErrorResponse = {
  status: TransactionFailureResponse.status.FAILURE;
} & TransactionFailureResponse;

export type OneTimePremiumBPMResponse =
  | OneTimePremiumBPMSucessResponse
  | OneTimePremiumBPMErrorResponse;

// Define a custom type that extends OneTimePremiumRequest with flexible paymentForm
export type ExtendedOneTimePremiumRequest = Omit<
  OneTimePremiumRequest,
  'payor'
> & {
  payor: Omit<OneTimePremiumRequest['payor'], 'paymentForm'> & {
    paymentForm?: PaymentForm | string;
  };
};
export const getOneTimePremiumValidation = withLogging(
  async (
    options: PolicyRequestInputs,
    ottpRequestDetails: ExtendedOneTimePremiumRequest,
    loggingContext: CommonLogContext
  ): Promise<OneTimePremiumBPMResponse> => {
    const { planCode, policyNumber } = options;
    const url = `${await transactionsAPIUrl()}/${planCode}/${policyNumber}/onetimepremium/validation`;

    const rawResponse = await ServerApi.post(
      url,
      JSON.stringify(ottpRequestDetails),
      {
        headers: { 'Content-Type': 'application/json' },
      },
      loggingContext
    );

    const response = await parseAPIResponse(rawResponse);

    if (rawResponse.status > 400) {
      throw new Error('Error fetching one time premium validation', {
        cause: await logApiNotOkDetails({
          rawResponse,
          parsedResponse: response,
        }),
      });
    }

    return response;
  },
  { file: FILE_NAME, functionName: 'getOneTimePremiumValidation' }
);

export const submitOneTimePremiumPayment = withLogging(
  async (
    options: PolicyRequestInputs,
    paymentDetails: ExtendedOneTimePremiumRequest,
    loggingCtx: CommonLogContext
  ) => {
    if (isMockErrorEnabled(ApiEndpoints.ONE_TIME_PREMIUM_PAYMENT)) {
      throw new Error('Error making one time premium payment.');
    }

    const { planCode, policyNumber } = options;
    const url = `${await transactionsAPIUrl()}/${planCode}/${policyNumber}/onetimepremium`;

    const rawResponse = await ServerApi.post(
      url,
      JSON.stringify(paymentDetails),
      {
        headers: { 'Content-Type': 'application/json' },
      },
      loggingCtx
    );

    const response = await parseAPIResponse(rawResponse);

    if (rawResponse.status > 400 || !response.caseId?.length) {
      throw new Error('Error submitting one time premium payment', {
        cause: await logApiNotOkDetails({
          rawResponse,
          parsedResponse: response,
        }),
      });
    }

    return response;
  },
  { file: FILE_NAME, functionName: 'submitOneTimePremiumPayment' }
);

export const getOneTimePremiumEligibility = withLogging(
  async (options: PolicyRequestInputs, loggingCtx: CommonLogContext) => {
    const { planCode, policyNumber } = options;
    const url = `${await transactionsAPIUrl()}/${planCode}/${policyNumber}/onetimepremium/eligibilitycheck`;

    const rawResponse = await ServerApi.post(
      url,
      JSON.stringify({}),
      {
        headers: { 'Content-Type': 'application/json' },
      },
      loggingCtx
    );

    const response = await parseAPIResponse(rawResponse);

    if (rawResponse.status > 400) {
      logError(
        'Error fetching one time premium eligibility',
        await logApiNotOkDetails({ rawResponse, parsedResponse: response })
      );

      throw new Error('Error fetching PolicyLoanEligibility');
    }

    return transformEligibility(response);
  },
  { file: FILE_NAME, functionName: 'getOneTimePremiumEligibility' }
);
