import { CaseSearchResponse, CaseSummary } from '@/types/case';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { logError } from '@/utils/logging/log-fns';
import { CommonLogContext } from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';
import { CaseSearchCriteria } from '@zinnia/api-types/types/case';

import {
  caseManagementBaseUrl,
  enterpriseCaseSearchBaseUrl,
} from '../api-config';
import { EnterpriseTokenApi } from '../enterprise-api-token-http';
import { transformCaseSearchResponse } from './transformers';

const FILE_NAME = '/src/services/case/index.ts';

export const fetchCaseEnterpriseSearch = withLogging(
  async (
    caseId: string | string[],
    loggingCtx: CommonLogContext
  ): Promise<CaseSummary> => {
    let caseIds: string[] = [];
    if (Array.isArray(caseId)) {
      caseIds = caseId;
    } else {
      caseIds = [caseId];
    }
    const url = new URL(caseManagementBaseUrl);

    const rawResponse = await EnterpriseTokenApi.post(
      url.href,
      JSON.stringify({
        caseIds,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
      loggingCtx
    );

    const response = await parseAPIResponse(rawResponse);

    if (!rawResponse?.ok) {
      logError(
        'Error fetching case',
        JSON.stringify(
          await logApiNotOkDetails({ rawResponse, parsedResponse: response })
        )
      );

      throw new Error('Error fetching case', {
        cause: {
          details: await logApiNotOkDetails({
            rawResponse,
            parsedResponse: response,
          }),
          status: rawResponse.status,
        },
      });
    }

    return response;
  },
  {
    file: FILE_NAME,
    functionName: 'fetchCaseEnterpriseSearch',
  }
);

export interface CaseSearchCriteriaWithLimit extends CaseSearchCriteria {
  limit?: number;
}

export const searchCases = withLogging(
  async (
    searchData: CaseSearchCriteriaWithLimit,
    loggingCtx: CommonLogContext
  ) => {
    const url = `${enterpriseCaseSearchBaseUrl}/search`;

    const rawResponse = await EnterpriseTokenApi.post(
      url,
      JSON.stringify({ ...searchData }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
      loggingCtx
    );

    const response: CaseSearchResponse = await parseAPIResponse(rawResponse);

    if (!rawResponse?.ok) {
      throw new Error('Error calling search case', {
        cause: {
          details: await logApiNotOkDetails({
            rawResponse,
            parsedResponse: response,
          }),
          status: rawResponse.status,
        },
      });
    }
    // Transformer to return only the fields we need for comparing to acknowledged cases.
    return transformCaseSearchResponse(response);
  },
  {
    file: FILE_NAME,
    functionName: 'searchCases',
  }
);
