import { transactionApiBaseUrl } from '@/services/api-config';
import { transformEligibility } from '@/services/bpm/transformers';
import { ServerApi } from '@/services/server-http';
import { TransactionEligbility } from '@/types/transactions';
import { parseAPIResponse } from '@/utils/api';
import { logTrace } from '@/utils/logging/log-fns';
import { CommonLogContext } from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';

const FILE_NAME = '/src/services/bpm/fullsurrender/index.ts';

export const getPolicySurrenderEligibility = withLogging(
  async (
    planCode: string,
    policyNumber: string,
    loggingCtx: CommonLogContext
  ): Promise<TransactionEligbility> => {
    const url = `${transactionApiBaseUrl}/${planCode}/${policyNumber}/fullsurrender/eligibilitycheck`;
    const rawResponse = await ServerApi.post(
      url,
      // For some reason we need to pass a body here, even if it's empty.
      // The backend team knows about this.
      JSON.stringify({
        correlationId: '',
        effectiveDate: '',
        reverseInitiator: false,
        taxWithholdingInstructions: [],
        payeeOrBeneficiary: null,
        parties: [],
        transactionAmounts: {
          requestedAmount: null,
          amountType: '',
          disbursementType: '',
          disbursementPaymentForm: '',
        },
        charges: null,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
      loggingCtx
    );

    const response = await parseAPIResponse(rawResponse);

    if (rawResponse.status === 400) {
      logTrace('Surrender ineligible reason', {
        results: response?.validationResult,
      });
    }

    if (rawResponse.status > 400) {
      throw new Error('Error checking eligibility for full surrender.', {
        cause: { policyNumber, planCode },
      });
    }
    return transformEligibility(response);
  },
  { file: FILE_NAME, functionName: 'getPolicySurrenderEligibility' }
);
