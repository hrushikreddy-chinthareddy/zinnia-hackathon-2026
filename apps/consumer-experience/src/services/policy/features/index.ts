import { PolicyFeature } from '@zinnia/api-types/types/sor';

import { ApiResponse } from '@/services';
import { policyApiBaseUrl } from '@/services/api-config';
import { ServerApi } from '@/services/server-http';
import { PolicyRequestInputs } from '@/types/policy';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { CommonLogContext } from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';

const FILE_NAME = '/src/services/policy/features/index.ts';

export const getPolicyFeatures = withLogging(
  async (
    options: PolicyRequestInputs,
    loggingCtx: CommonLogContext
  ): Promise<ApiResponse<PolicyFeature[]>> => {
    const { planCode, policyNumber } = options;
    const url = `${policyApiBaseUrl}/${planCode}/${policyNumber}/features`;
    const rawResponse = await ServerApi.get(url, undefined, loggingCtx);
    const response = await parseAPIResponse(rawResponse);

    if (!rawResponse?.ok || !response.data) {
      let moreDetails = {};
      if (!rawResponse?.ok) {
        moreDetails = await logApiNotOkDetails({
          rawResponse,
          parsedResponse: response,
        });
      }

      throw new Error('Error fetching features for policy', {
        cause: { policyNumber, planCode, moreDetails },
      });
    }

    return response;
  },
  {
    file: FILE_NAME,
    functionName: 'getSystematicPrograms',
  }
);
