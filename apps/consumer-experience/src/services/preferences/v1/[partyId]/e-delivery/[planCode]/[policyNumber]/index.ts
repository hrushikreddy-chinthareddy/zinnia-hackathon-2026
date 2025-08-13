import * as jose from 'jose';

import { preferencesBaseUrl } from '@/services/api-config';
import { ServerApi } from '@/services/server-http';
import { UserClaims } from '@/types/auth';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { getAccessToken } from '@/utils/auth';
import { logTrace } from '@/utils/logging/log-fns';
import { CommonLogContext } from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';

const FILE_NAME =
  'src/services/preferences/v1/[partyId]/e-delivery/[planCode]/[policyNumber]/index.ts';

export const getPreferencesByPlanCode = withLogging(
  async (
    {
      planCode,
      policyNumber,
    }: {
      planCode: string;
      policyNumber: string;
    },
    loggingContext: CommonLogContext
  ) => {
    const { accessToken } = await getAccessToken();
    const decodedToken = jose.decodeJwt(accessToken ?? '') as UserClaims;
    const partyId = decodedToken.partyId;

    const url = new URL(
      `${preferencesBaseUrl}/${partyId}/e-delivery/${planCode}/${policyNumber}`
    );
    const rawResponse = await ServerApi.get(url, undefined, loggingContext);
    const response = await parseAPIResponse(rawResponse);

    if (rawResponse.status === 404) {
      logTrace('Could not find preferences for policy', {
        planCode,
        policyNumber,
        partyId,
        loggingContext,
      });

      return response;
    }

    if (!rawResponse?.ok) {
      throw new Error(
        `Error fetching list of prefences for ${planCode} ${policyNumber}`,
        {
          cause: await logApiNotOkDetails({
            rawResponse,
            parsedResponse: response,
          }),
        }
      );
    }

    return response;
  },
  { file: FILE_NAME, functionName: 'getPreferencesByPlanCode' }
);
