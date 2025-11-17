import { CaseSearchResponse, CaseSummary } from '@/types/case';

export type ReducedCaseInstanceSummary = Pick<
  CaseSummary,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'caseStatus'
  | 'stages'
  | 'process'
  | 'processSubType'
>;

export type TransformedCaseSearchResponse = {
  data: ReducedCaseInstanceSummary[];
} & CaseSearchResponse;
