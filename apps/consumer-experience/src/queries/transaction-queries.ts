import { SystematicPremiumsState } from '@/components/providers/systematic-premiums/types';
import { WithdrawalsState } from '@/components/providers/withdrawals/types';
import { WithdrawalSubmissionResponse, WithdrawalValidationResposne } from '@/services/bpm/partial-withdrawal';
import { TransactionEligbilityResponse } from '@/services/bpm/systematic-programs';
import { ClientApi } from '@/services/client-http';


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

export const getSystematicPremiumValidation  = async ({
  planCode,
  policyNumber,
  body,
}: {
  planCode: string;
  policyNumber: string;
  body: SystematicPremiumsState;
}): Promise<TransactionEligbilityResponse> => {
  return await (
    await ClientApi.post(
      `/api/bpm/${planCode}/${policyNumber}/systematic-premium/validation`,
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
}): Promise<TransactionEligbilityResponse> => {
  return await (
    await ClientApi.post(
      `/api/bpm/${planCode}/${policyNumber}/systematic-premium`,
      JSON.stringify(body)
    )
  ).json();
};