import { ApiResponse } from '@/services';
import { ClientApi } from '@/services/client-http';
import { CaseSummary } from '@/types/case';

export const searchCasesByPolicyNumber = async (policyNumber: string, planCode?: string) => {
  const response: ApiResponse<CaseSummary[]> = await (
    await ClientApi.post(`/api/case/search`, JSON.stringify({ policyNumber, planCode }))
  ).json();
  if (response.error || !response) {
    throw response.error;
  }

  return response.data;
};

export const getCaseDetails = async (caseId: string) => {
  const response: ApiResponse<CaseSummary> = await (
    await ClientApi.get(`/api/case/search/${caseId}`)
  ).json();
  if (response.error || !response) {
    throw response.error;
  }

  return response.data;
};