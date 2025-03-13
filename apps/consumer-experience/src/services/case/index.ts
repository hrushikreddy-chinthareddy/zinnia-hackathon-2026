import { CaseSearchCriteria } from '@zinnia/api-types/types/case';

import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { logError, logWarn } from '@/utils/logging/server-logging';

import { caseManagementBaseUrl } from '../api-config';
import { ServerApi } from '../server-http';

const searchCases = async (searchData: CaseSearchCriteria) => {
  const url = `${caseManagementBaseUrl}/search`;

  const rawResponse = await ServerApi.post(url, JSON.stringify(searchData), {
    headers: { 'Content-Type': 'application/json' },
  });

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
};

export const searchCasesByPolicyNumber = async ({
  policyNumber,
  // TODO: i'm assuming i should include this because policyNumber is not
  // guaranteed unique?
  carrierCode,
}: {
  policyNumber: string;
  carrierCode?: string;
}) => {
  try {
    // TODO: do i need to transform this response at all?
    const response = await searchCases({ policyNumber });

    return {
      data: response.data,
      error: null,
    };
  } catch (error) {
    logWarn('error thrown in searchCasesByPolicyNumber', { error });
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
