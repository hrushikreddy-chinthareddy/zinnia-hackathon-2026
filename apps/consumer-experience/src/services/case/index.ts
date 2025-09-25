import { CaseSearchCriteria } from '@zinnia/api-types/types/case';

import { CaseSummary } from '@/types/case';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { logError } from '@/utils/logging/log-fns';
import { CommonLogContext } from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import {
  caseManagementBaseUrl,
  enterpriseCaseSearchBaseUrl,
} from '../api-config';
import { EnterpriseTokenApi } from '../enterprise-api-token-http';
import { getFeatureFlags } from '../feature-flags';

type CaseSearchServiceResponse = {
  data: CaseSummary[] | null;
  error: {
    message: string;
    status: number;
    name: string;
  } | null;
};

const FILE_NAME = '/src/services/case/index.ts';

// TODO: remove this wrapper
// and only use `fetchCaseEnterpriseSearch`, renaming it to `fetchCase` when
// https://zinnia.atlassian.net/browse/ZC-1524 is complete
export const fetchCase = async (
  caseId: string,
  loggingCtx: CommonLogContext
) => {
  const featureFlags = await getFeatureFlags();

  if (featureFlags?.[FEATURE_FLAGS.ENTERPRISE_CASE_SEARCH]) {
    return fetchCaseEnterpriseSearch(caseId, loggingCtx);
  }

  return fetchCaseLegacy(caseId, loggingCtx);
};

const fetchCaseEnterpriseSearch = withLogging(
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

const fetchCaseLegacy = withLogging(
  async (
    caseId: string,
    loggingCtx: CommonLogContext
  ): Promise<CaseSummary> => {
    const url = new URL(caseManagementBaseUrl);
    url.pathname = `${url.pathname}/${caseId}`;

    const rawResponse = await EnterpriseTokenApi.get(
      url.href,
      {
        headers: { 'Content-Type': 'application/json' },
      },
      loggingCtx
    );

    const response = await parseAPIResponse(rawResponse);

    if (!rawResponse?.ok) {
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
    functionName: 'fetchCaseLegacy',
  }
);

export const searchCases = withLogging(
  async (
    searchData: CaseSearchCriteria,
    loggingCtx: CommonLogContext
  ): Promise<CaseSearchServiceResponse> => {
    // TODO: remove this when https://zinnia.atlassian.net/browse/ZC-1524 is complete
    // to always use enterpriseCaseSearchBaseUrl
    // const url = `${enterpriseCaseSearchBaseUrl}/search`;
    let baseUrl = caseManagementBaseUrl;
    const featureFlags = await getFeatureFlags();
    if (featureFlags?.[FEATURE_FLAGS.ENTERPRISE_CASE_SEARCH]) {
      baseUrl = enterpriseCaseSearchBaseUrl;
    }
    const url = `${baseUrl}/search`;

    const rawResponse = await EnterpriseTokenApi.post(
      url,
      JSON.stringify(searchData),
      {
        headers: { 'Content-Type': 'application/json' },
      },
      loggingCtx
    );

    const response = await parseAPIResponse(rawResponse);

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

    return response;
  },
  {
    file: FILE_NAME,
    functionName: 'searchCases',
  }
);
