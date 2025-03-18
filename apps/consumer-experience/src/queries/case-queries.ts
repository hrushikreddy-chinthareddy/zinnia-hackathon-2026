import { ApiResponse } from '@/services';
import { ClientApi } from '@/services/client-http';
import { CaseSummary } from '@/types/case';

export const searchCasesByPolicyNumber = async (policyNumber: string) => {
  const response: ApiResponse<CaseSummary[]> = await (
    await ClientApi.post(`/api/case/search`, JSON.stringify({ policyNumber }))
  ).json();
  if (response.error || !response) {
    throw response.error;
  }

  return response.data;
};
