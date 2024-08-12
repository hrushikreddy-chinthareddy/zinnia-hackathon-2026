import { ApiResponse } from '@/services';
import { ClientApi } from '@/services/client-http';
import { PolicyProfile } from '@/types/policy';

export const getPolicyProfile = async (
  planCode: string,
  policyNumber: string
) => {
  const response: ApiResponse<PolicyProfile> = await (
    await ClientApi.get(`/api/policies/${planCode}/${policyNumber}/profile`)
  ).json();
  if (response.error || !response) {
    throw response.error;
  }
  return response.data;
};
