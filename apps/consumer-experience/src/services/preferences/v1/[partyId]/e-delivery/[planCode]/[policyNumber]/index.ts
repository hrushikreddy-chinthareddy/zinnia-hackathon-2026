import * as jose from 'jose';

import { preferencesBaseUrl } from '@/services/api-config';
import { EnterpriseTokenApi } from '@/services/enterprise-api-token-http';
import { UserClaims } from '@/types/auth';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { getAccessToken } from '@/utils/auth';
import { logError } from '@/utils/logging/server-logging';

export const getPreferencesByPlanCode = async ({
  planCode,
  policyNumber,
}: {
  planCode: string;
  policyNumber: string;
}) => {
  const { accessToken } = await getAccessToken();
  const decodedToken = jose.decodeJwt(accessToken ?? '') as UserClaims;
  const partyId = decodedToken.partyId;

  const url = new URL(
    `${preferencesBaseUrl}/${partyId}/e-delivery/${planCode}/${policyNumber}`
  );
  const rawResponse = await EnterpriseTokenApi.get(url);
  const response = await parseAPIResponse(rawResponse);

  if (!rawResponse?.ok) {
    logError(
      `Error fetching list of prefences for ${planCode} ${policyNumber}`,
      await logApiNotOkDetails({ rawResponse, parsedResponse: response })
    );

    // It's always assumed that the user has preferences set, so if we get a 404, we return an empty array
    if (response.statusCode === 404) {
      return {
        data: [],
        error: null,
      };
    }

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'getPreferencesByPlanCode error',
      },
    };
  }

  return { data: response, error: null };
};
