import { SystematicProgramUpdateRequest } from '@xd/api-types/dist/generated-types/bpm';

import { SystematicPremiumsState } from '@/components/providers/systematic-premiums/types';
import { WithdrawalsState } from '@/components/providers/withdrawals/types';
import { ApiResponse } from '@/services';
import {
  WithdrawalSubmissionResponse,
  WithdrawalValidationResposne,
} from '@/services/bpm/partial-withdrawal';
import {
  SystematicProgramBPMResponse,
  SystematicProgramTransactionResponse,
  TransactionEligbilityResponse,
} from '@/services/bpm/systematic-programs';
import { ClientApi } from '@/services/client-http';
import { PolicyRequestInputs } from '@/types/policy';
import { TransactionEligbility } from '@/types/transactions';

export const getPartialWithdrawalOneTimeValidation = async ({
  planCode,
  policyNumber,
  body,
}: {
  planCode: string;
  policyNumber: string;
  body: WithdrawalsState;
}): Promise<WithdrawalValidationResposne> => {
  return await (
    await ClientApi.post(
      `/api/bpm/${planCode}/${policyNumber}/partial-withdrawal-one-time/validation`,
      JSON.stringify(body)
    )
  ).json();
};

export const submitPartialWithdrawalOneTime = async ({
  planCode,
  policyNumber,
  body,
}: {
  planCode: string;
  policyNumber: string;
  body: WithdrawalsState;
}): Promise<WithdrawalSubmissionResponse> => {
  return await (
    await ClientApi.post(
      `/api/bpm/${planCode}/${policyNumber}/partial-withdrawal-one-time`,
      JSON.stringify(body)
    )
  ).json();
};

export const getSystematicPremiumValidation = async ({
  planCode,
  policyNumber,
  body,
}: {
  planCode: string;
  policyNumber: string;
  body: SystematicPremiumsState;
}): Promise<ApiResponse<SystematicProgramBPMResponse>> => {
  return await (
    await ClientApi.post(
      `/api/bpm/${planCode}/${policyNumber}/systematic-programs/validate`,
      JSON.stringify(body)
    )
  ).json();
};

export const submitSystematicPremium = async ({
  planCode,
  policyNumber,
  body,
}: {
  planCode: string;
  policyNumber: string;
  body: SystematicPremiumsState;
}): Promise<ApiResponse<SystematicProgramTransactionResponse>> => {
  return await (
    await ClientApi.post(
      `/api/bpm/${planCode}/${policyNumber}/systematic-programs`,
      JSON.stringify(body)
    )
  ).json();
};

export const cancelSystematicPremium = async ({
  planCode,
  policyNumber,
  arrangementId,
  body,
}: {
  arrangementId: string;
  planCode: string;
  policyNumber: string;
  body: SystematicProgramUpdateRequest;
}) => {
  const response: ApiResponse<SystematicProgramTransactionResponse> = await (
    await ClientApi.post(
      `/api/bpm/${planCode}/${policyNumber}/systematic-programs/${arrangementId}/cancel`,
      JSON.stringify(body)
    )
  ).json();

  if (response.error || !response) {
    throw response.error;
  }

  return response.data;
};

export const getSystematicProgramsEligibility = async ({
  planCode,
  policyNumber,
}: PolicyRequestInputs) => {
  const response: ApiResponse<TransactionEligbilityResponse> = await (
    await ClientApi.get(
      `/api/bpm/${planCode}/${policyNumber}/systematic-programs/eligibility`
    )
  ).json();

  if (response.error || !response) {
    throw response.error;
  }

  return response.data;
};

export const getPremiumEligibility = async ({
  planCode,
  policyNumber,
}: PolicyRequestInputs) => {
  const response: ApiResponse<TransactionEligbility> = await (
    await ClientApi.get(
      `/api/bpm/${planCode}/${policyNumber}/onetimepremium/eligibility`
    )
  ).json();

  if (response.error || !response) {
    throw response.error;
  }

  return response.data;
};
