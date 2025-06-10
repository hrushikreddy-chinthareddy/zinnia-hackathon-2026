import { WithdrawalsState } from '@/components/providers/withdrawals/types';
import { WithdrawalSubmissionResponse, WithdrawalValidationResposne } from '@/services/bpm/partial-withdrawal';
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
