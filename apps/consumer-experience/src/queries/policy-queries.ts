import { Policy } from '@zinnia/api-types/types/sor';

import { ApiResponse } from '@/services';
import { ClientApi } from '@/services/client-http';
import { Fund } from '@/services/funds';
import { PolicyProfile, PolicyStatusDetail } from '@/types/policy';

/**
 *
 * @param planCode
 * @param policyNumber
 * @returns Top level or basic policy information
 */
export const getPolicyDetails = async (
  planCode: string,
  policyNumber: string
) => {
  const response: ApiResponse<Partial<Policy>> = await (
    await ClientApi.get(`/api/policies/${planCode}/${policyNumber}`)
  ).json();
  if (response.error || !response) {
    throw response.error;
  }

  return response.data;
};

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

export const getPolicyStatusDetails = async (
  planCode: string,
  policyNumber: string
) => {
  const response: ApiResponse<PolicyStatusDetail> = await (
    await ClientApi.get(`/api/policies/${planCode}/${policyNumber}/status`)
  ).json();
  if (response.error || !response) {
    throw response.error;
  }
  return response.data;
};

export const checkIfPolicyRequiresAcknowledgement = async (
  planCode: string,
  policyNumber: string
) => {
  const response: ApiResponse<{
    isEligible: boolean;
    policyNumber: string;
    planCode: string;
  }> = await (
    await ClientApi.get(
      `/api/policies/${planCode}/${policyNumber}/requires-acknowledgement`
    )
  ).json();

  if (response.error || !response) {
    throw response.error;
  }
  return response.data;
};
