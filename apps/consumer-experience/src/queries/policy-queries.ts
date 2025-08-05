import { SystematicProgram } from '@xd/api-types/dist/generated-types/sor';

import { ApiResponse } from '@/services';
import { ClientApi } from '@/services/client-http';
import { Fund } from '@/services/funds/types';
import {
  PolicyProfile,
  PolicyRequestInputs,
  PolicyStatusDetail,
  PolicyWithAgent,
  UpcomingPremium,
} from '@/types/policy';
import { CarrierListDetail } from '@/utils/carriers';

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
  const response: ApiResponse<PolicyWithAgent> = await (
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

export const getAllSystematicPrograms = async ({
  planCode,
  policyNumber,
}: PolicyRequestInputs) => {
  const response: ApiResponse<SystematicProgram[]> = await (
    await ClientApi.get(
      `/api/policies/${planCode}/${policyNumber}/systematic-programs`
    )
  ).json();

  if (response.error || !response) {
    throw response.error;
  }

  return response.data;
};

export const getUpcomingPremium = async ({
  planCode,
  policyNumber,
}: PolicyRequestInputs) => {
  const response: ApiResponse<UpcomingPremium> = await (
    await ClientApi.get(`/api/policies/${planCode}/${policyNumber}/premiums`)
  ).json();

  if (response.error || !response) {
    throw response.error;
  }

  return response.data;
};

export const getPoliciesByCarrier = async (carriers?: string[]) => {
  const response: ApiResponse<CarrierListDetail[]> = await (
    await ClientApi.get(
      `/api/policies/by-carrier?carriers=${carriers?.join(',')}`
    )
  ).json();

  if (response.error || !response) {
    throw response.error;
  }

  return response.data;
};
