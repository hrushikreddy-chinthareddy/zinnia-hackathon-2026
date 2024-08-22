import { Policy } from '@zinnia/api-types/types/sor';

import { ApiResponse } from '@/services';
import { ClientApi } from '@/services/client-http';
import { Fund } from '@/services/funds';
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

export const getPolicyFunds = async (
  planCode: string,
  policyNumber: string
) => {
  const response: ApiResponse<Fund[]> = await (
    await ClientApi.get(`/api/policies/${planCode}/${policyNumber}/funds`)
  ).json();
  if (response.error || !response) {
    throw response.error;
  }
  return response.data;
};

export const getPolicy = async (planCode: string, policyNumber: string) => {
  const response: ApiResponse<Policy> = await (
    await ClientApi.get(`/api/policies/${planCode}/${policyNumber}`)
  ).json();

  console.log('route handler policy', response);
  if (response.error || !response) {
    throw response.error;
  }
  return response.data;
};
