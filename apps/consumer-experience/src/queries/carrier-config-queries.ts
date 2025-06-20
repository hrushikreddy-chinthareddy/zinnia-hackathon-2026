import { ApiResponse } from '@/services';
import { ClientApi } from '@/services/client-http';
import { CarrierConfig } from '@/types/carrier-config';

// Use this to get the carrier config from client side components
export const getCarrierConfig = async () => {
  const response: ApiResponse<CarrierConfig> = await (
    await ClientApi.get(`/api/carrier-config`)
  ).json();
  if (response.error || !response) {
    throw response.error;
  }

  return response.data;
};
