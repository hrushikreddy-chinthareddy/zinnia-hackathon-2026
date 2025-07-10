import { ApiResponse } from '@/services';
import { ClientApi } from '@/services/client-http';
import { FeatureFlags } from '@/utils/optimizely/optimizely';

export const getFeatureFlags = async () => {
  const response: ApiResponse<FeatureFlags> = await (
    await ClientApi.get(`/api/feature-flags`)
  ).json();

  if (response.error || !response) {
    throw response.error;
  }

  return response.data;
};
