import { ApiEndpoints } from '@/components/dev-menu/types';
import { bpmApiBaseUrl, isMockErrorEnabled } from '@/services/api-config';
import { ServerApi } from '@/services/server-http';
import { PolicyRequestInputs } from '@/types/policy';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { CommonLogContext } from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';

import { transformEligibility } from '../transformers';

const FILE_NAME = '/src/services/bpm/policy-loan/index.ts';

export const getPolicyLoanEligibility = withLogging(
  async (options: PolicyRequestInputs, loggingCtx: CommonLogContext) => {
    const { planCode, policyNumber } = options;
    const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/newloan/eligibilitycheck`;
    if (isMockErrorEnabled(ApiEndpoints.WITHDRAWAL_ELIGIBILITY)) {
      throw new Error('Error fetching loan eligibility.');
    }

    const rawResponse = await ServerApi.post(
      url,
      JSON.stringify({}),
      {
        headers: { 'Content-Type': 'application/json' },
      },
      loggingCtx
    );

    const response = await parseAPIResponse(rawResponse);

    // This endpoint returns 400 "not found" when the policy is not eligible withdrawals
    if (rawResponse.status > 400) {
      throw new Error('Error fetching PolicyLoanEligibility', {
        cause: await logApiNotOkDetails({
          rawResponse,
          parsedResponse: response,
        }),
        ...loggingCtx,
      });
    }

    return transformEligibility(response);
  },
  { file: FILE_NAME, functionName: 'getPolicyLoanEligibility' }
);
