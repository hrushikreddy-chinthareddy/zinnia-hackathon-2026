import { ApiResponse } from '@/services';
import { ClientApi } from '@/services/client-http';
import {
  AcknowledgeCaseDTO,
  CaseAcknowledgmentItem,
} from '@/services/terms-and-conditions';
import { CaseSummary } from '@/types/case';

export const searchCasesByPolicyNumber = async (
  policyNumber: string,
  planCode?: string
) => {
  const response: ApiResponse<CaseSummary[]> = await (
    await ClientApi.post(
      `/api/case/search`,
      JSON.stringify({ policyNumber, planCode })
    )
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

export const getAcknowledgedCases = async ({
  planCode,
  policyNumber,
}: {
  planCode: string;
  policyNumber: string;
}) => {
  const response: ApiResponse<Array<CaseAcknowledgmentItem>> = await (
    await ClientApi.get(`/api/case-acknowledgment/${planCode}/${policyNumber}`)
  ).json();
  if (response.error || !response) {
    throw response.error;
  }

  return response.data;
};

export const acknowledgeCase = async (body: AcknowledgeCaseDTO) => {
  const response: ApiResponse<string> = await (
    await ClientApi.post(
      `/api/case-acknowledgment/${body.planCode}/${body.policyNumber}`,
      JSON.stringify(body)
    )
  ).json();
  if (response.error || !response) {
    throw response.error;
  }

  return response.data;
};
