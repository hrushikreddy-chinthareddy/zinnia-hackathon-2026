import { ApiResponse } from '@/services';
import { CaseSearchCriteriaWithLimit } from '@/services/case';
import { TransformedCaseSearchResponse } from '@/services/case/types';
import { ClientApi } from '@/services/client-http';
import {
  AcknowledgeCaseDTO,
  CaseAcknowledgmentItem,
} from '@/services/terms-and-conditions';

export const searchCasesByPolicyNumber = async (
  body: CaseSearchCriteriaWithLimit
) => {
  const response: ApiResponse<TransformedCaseSearchResponse> = await (
    await ClientApi.post(`/api/case/search`, JSON.stringify(body))
  ).json();
  if (response.error || !response) {
    throw response.error;
  }
  return response.data;
};

export const getCaseDetails = async (caseId: string) => {
  const response: ApiResponse<TransformedCaseSearchResponse> = await (
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
