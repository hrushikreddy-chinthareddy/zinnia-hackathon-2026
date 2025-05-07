import { CaseSearchCriteria } from '@zinnia/api-types/types/case';

import { CaseSummary } from '@/types/case';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { logError } from '@/utils/logging/server-logging';

import { caseManagementBaseUrl } from '../api-config';
import { EnterpriseTokenApi } from '../enterprise-api-token-http';

type CaseSearchServiceResponse = {
  data: CaseSummary[] | null;
  error: {
    message: string;
    status: number;
    name: string;
  } | null;
};

export const fetchCase = async (caseId: string) => {
  const url = new URL(caseManagementBaseUrl);
  url.pathname = `${url.pathname}/${caseId}`;

  try {
    const rawResponse = await EnterpriseTokenApi.get(url.href, {
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await parseAPIResponse(rawResponse);

    if (!rawResponse?.ok) {
      logError(
        'Error fetching case',
        JSON.stringify(
          await logApiNotOkDetails({ rawResponse, parsedResponse: response })
        )
      );

      throw new Error('Error fetching case');
    }

    return {
      data: response,
      error: null,
    };
  } catch {
    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'fetchCase Error',
      },
    };
  }
};

const searchCases = async (
  searchData: CaseSearchCriteria
): Promise<CaseSearchServiceResponse> => {
  const url = `${caseManagementBaseUrl}/search`;

  const rawResponse = await EnterpriseTokenApi.post(
    url,
    JSON.stringify(searchData),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  try {
    const response = await parseAPIResponse(rawResponse);

    if (!rawResponse?.ok) {
      logError(
        'Error searching case by policy number',
        await logApiNotOkDetails({
          rawResponse,
          parsedResponse: response,
        })
      );

      throw new Error('Error calling search case', {
        cause: response.status,
      });
    }

    return response;
  } catch (error) {
    return {
      data: null,
      error: {
        message: 'Something went wrong',
        // TODO: fix this to be the status
        status: 500,
        name: 'searchCases Error',
      },
    };
  }
};

export const searchCasesByPolicyNumber = async ({
  policyNumber,
  // TODO: i'm assuming i should include this because policyNumber is not
  // guaranteed unique?
  carrierCode: _carrierCode,
}: {
  policyNumber: string;
  carrierCode?: string;
}): Promise<CaseSearchServiceResponse> => {
  try {
    // TODO: do i need to transform this response at all?
    const response = await searchCases({ policyNumber });

    return {
      data: response.data,
      error: null,
    };
  } catch (error) {
    logError('error thrown in searchCasesByPolicyNumber', { error });
    return {
      data: null,
      error: {
        message: 'Something went wrong',
        // TODO: fix this to be the status
        status: 500,
        name: 'searchCasesByPolicyNumber Error',
      },
    };
  }
};
