import {
  TransactionAcceptedResponse,
  TransactionFailureResponse,
} from '@xd/api-types/dist/generated-types/bpm';

import { ApiResponse } from '@/services';
import { OneTimePremiumBPMResponse } from '@/services/bpm/one-time-premium-payment';
import { ClientApi } from '@/services/client-http';

export const submitOttp = async (
  policyNumber: string,
  planCode: string,
  body: {
    paymentAmount: number;
    effectiveDate: string;
    partyId?: string;
    bankId?: string;
  }
) => {
  const response: ApiResponse<
    TransactionAcceptedResponse | TransactionFailureResponse
  > = await (
    await ClientApi.post(
      `/api/bpm/${planCode}/${policyNumber}/onetimepremium`,
      JSON.stringify(body),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )
  ).json();

  if (response.error || !response || 'errors' in response.data) {
    throw response.error;
  }

  return response.data;
};

export const getOneTimePremiumValidation = async (
  policyNumber: string,
  planCode: string,
  body: {
    paymentAmount: number;
    effectiveDate: string;
    partyId?: string;
    bankId?: string;
  }
): Promise<OneTimePremiumBPMResponse> => {
  const response = await (
    await ClientApi.post(
      `/api/bpm/${planCode}/${policyNumber}/onetimepremium/validation`,
      JSON.stringify(body)
    )
  ).json();

  if (response.error || !response) {
    throw response.error;
  }

  return response.data;
};
