import { ApiResponse } from '@/services';
import { ClientApi } from '@/services/client-http';
import { PaymentMethod } from '@/types/payment';

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
  const response: ApiResponse<PaymentMethod[]> = await (
    await ClientApi.post(
      `/api/bpm/${planCode}/${policyNumber}/onetimepremium`,
      JSON.stringify(body),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )
  ).json();

  if (response.error || !response) {
    throw response.error;
  }
  return response.data;
};
