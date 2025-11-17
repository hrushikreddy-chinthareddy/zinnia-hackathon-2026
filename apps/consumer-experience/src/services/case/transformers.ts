import { CaseSearchResponse } from '@/types/case';

import { TransformedCaseSearchResponse } from './types';

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
