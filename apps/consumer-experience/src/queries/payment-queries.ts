import { ApiResponse } from '@/services';
import { ClientApi } from '@/services/client-http';
import { PaymentMethod, PaymentProvider } from '@/types/payment';

export const getPaymentMethods = async (
  policyNumber: string,
  planCode: string,
  provider: PaymentProvider
) => {
  const response: ApiResponse<PaymentMethod[]> = await (
    await ClientApi.get(
      `/api/payment/payment-methods/${planCode}/${policyNumber}/${provider}`
    )
  ).json();

  if (response.error || !response) {
    throw response.error;
  }
  return response.data;
};
