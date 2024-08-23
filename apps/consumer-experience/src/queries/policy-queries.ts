import { ApiResponse } from '@/services';
import { ClientApi } from '@/services/client-http';
import { Fund } from '@/services/funds';
import { PolicyAccountValue, PolicyProfile } from '@/types/policy';

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

// export const getPolicyProductType = async (
//   planCode: string,
//   policyNumber: string
// ) => {
//   const response: ApiResponse<Policy> = await (
//     await ClientApi.get(`/api/policies/${planCode}/${policyNumber}`)
//   ).json();

//   if (response.error || !response) {
//     throw response.error;
//   }
//   return response.data;
// };

export const getPolicyAccountValue = async (
  planCode: string,
  policyNumber: string
) => {
  const response: ApiResponse<PolicyAccountValue> = await (
    await ClientApi.get(
      `/api/policies/${planCode}/${policyNumber}/account-value`
    )
  ).json();

  if (response.error || !response) {
    throw response.error;
  }
  return response.data;
};
