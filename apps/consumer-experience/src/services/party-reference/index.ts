import { ApiEndpoints } from '@/components/dev-menu/types';
import { parseAPIResponse } from '@/utils/api';
import { CommonLogContext } from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';
import { PartyReferenceDataModel } from '@zinnia/api-types/types/partyreference';

import { apiServerBaseUrl, isMockErrorEnabled } from '../api-config';
import { ServerApi } from '../server-http';

const FILE_NAME = '/src/services/party-reference/index.ts';

/**
 * Returns party data from the party reference API
 */
export const getPartyReferenceData = withLogging(
  async (partyId: string, loggingCtx: CommonLogContext) => {
    const url = `${apiServerBaseUrl}/party/v1/parties/${partyId}/reference`;

    if (isMockErrorEnabled(ApiEndpoints.PARTY_REFERENCE)) {
      throw new Error('Error fetching party reference data.', {
        cause: { partyId },
      });
    }

    const rawResponse = await ServerApi.get(
      url,
      { cache: 'force-cache' },
      loggingCtx
    );
    const response: PartyReferenceDataModel =
      await parseAPIResponse(rawResponse);

    if (!rawResponse?.ok) {
      throw new Error('Error fetching party reference data.', {
        cause: { partyId },
      });
    }

    if (!response) {
      throw new Error(
        'No data returned trying to retrieve party reference data.',
        {
          cause: { partyId },
        }
      );
    }

    return response;
  },
  { file: FILE_NAME, functionName: 'getPartyReferenceData' }
);
