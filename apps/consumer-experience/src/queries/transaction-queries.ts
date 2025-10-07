import { SystematicProgramUpdateRequest } from '@xd/api-types/dist/generated-types/bpm';

import { SystematicPremiumsState } from '@/components/stepped-workflow/workflows/systematic-premiums/provider/types';
import { WithdrawalsState } from '@/components/stepped-workflow/workflows/withdrawals/provider/types';
import { ApiResponse } from '@/services';
import {
  PwotWithdrawalBPMResponse,
  WithdrawalSubmissionResponse,
} from '@/services/bpm/partial-withdrawal';
import {
  SystematicProgramBPMResponse,
  SystematicProgramTransactionResponse,
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
}): Promise<PwotWithdrawalBPMResponse> => {
  const response = await (
    await ClientApi.post(
      `/api/bpm/${planCode}/${policyNumber}/partial-withdrawal-one-time/validation`,
      JSON.stringify(body)
    )
  ).json();

  if (response.error || !response) {
    throw response.error;
  }

  return response.data;
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
  const response = await (
    await ClientApi.post(
      `/api/bpm/${planCode}/${policyNumber}/partial-withdrawal-one-time`,
      JSON.stringify(body)
    )
  ).json();

  if (response.error || !response) {
    throw response.error;
  }

  return response.data;
};

export const getSystematicPremiumValidation = async ({
  planCode,
  policyNumber,
  body,
}: {
  planCode: string;
  policyNumber: string;
  body: SystematicPremiumsState;
}): Promise<SystematicProgramBPMResponse> => {
  const response = await (
    await ClientApi.post(
      `/api/bpm/${planCode}/${policyNumber}/systematic-programs/validate`,
      JSON.stringify(body)
    )
  ).json();

  if (response.error || !response) {
    throw response.error;
  }

  return response.data;
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
  const response = await (
    await ClientApi.post(
      `/api/bpm/${planCode}/${policyNumber}/systematic-programs`,
      JSON.stringify(body)
    )
  ).json();

  if (response.error || !response) {
    throw response.error;
  }

  return response.data;
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
