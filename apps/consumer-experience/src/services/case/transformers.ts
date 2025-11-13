import { CaseSearchResponse, CaseSummary } from '@/types/case';

type ReducedCaseInstanceSummary = Pick<
  CaseSummary,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'caseStatus'
  | 'stages'
  | 'process'
  | 'processSubType'
>;

type TransformedCaseSearchResponse = {
  data: ReducedCaseInstanceSummary[];
} & CaseSearchResponse;

export function transformCaseSearchResponse(
  response: CaseSearchResponse
): TransformedCaseSearchResponse {
  if (!response?.data) return { data: [] };

  return {
    ...response,
    data: response.data.map(c => ({
      id: c.id,
      updatedAt: c.updatedAt,
      createdAt: c.createdAt,
      caseStatus: c.caseStatus,
      stages: c.stages,
      process: c.process,
      processSubType: c?.processSubType,
    })),
  };
}
