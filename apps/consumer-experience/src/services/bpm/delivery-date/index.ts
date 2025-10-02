import { bpmApiBaseUrl } from '@/services/api-config';
import { ServerApi } from '@/services/server-http';
import { PolicyRequestInputs } from '@/types/policy';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { POLICY_ACKNOWLEDGEMENT_DOC_TYPE } from '@/utils/data';
import { CommonLogContext } from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';

import { transformEligibility } from '../transformers';
import { BpmSuccessResponse, BpmErrorResponse } from '../types';

const FILE_NAME = '/src/services/bpm/delivery-date/index.ts';

export const checkResetDeliveryDateEligibility = withLogging(
  async (policyInputs: PolicyRequestInputs, loggingCtx: CommonLogContext) => {
    const { planCode, policyNumber } = policyInputs;
    const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/deliverydatesetup/eligibilitycheck`;
    const body = {
      correlationId: loggingCtx.correlationId,
      documentType: POLICY_ACKNOWLEDGEMENT_DOC_TYPE,
    };

    const rawResponse = await ServerApi.post(
      url,
      JSON.stringify(body),
      {
        headers: { 'Content-Type': 'application/json' },
      },
      loggingCtx
    );
    const response: BpmSuccessResponse | BpmErrorResponse =
      await parseAPIResponse(rawResponse);

    if (rawResponse.status >= 400) {
      // There was lots of back and forth with BPM about this. They are checking partyId (from our accessToken) is inside the preferences API.
      // Currently BPM is returning a 404 if a partyId is not found in the preferences api. We asked them to return a 400 like the
      // other validation checks, but were told that until other use cases for this exist, this is what we get.
      // TODO: Once BPM fixes this, we should update this so that we send the logError for anything over 400.

      return {
        isEligible: false,
        policyNumber,
        planCode,
        reasons:
          rawResponse.status === 400
            ? (response as BpmErrorResponse)?.validationResult
            : [],
      };
    }

    return {
      isEligible: true,
      policyNumber,
      planCode,
      reasons: [],
    };
  },
  { file: FILE_NAME, functionName: 'checkResetDeliveryDateEligibility' }
);

export const postResetDeliveryDate = withLogging(
  async (policyInputs: PolicyRequestInputs, loggingCtx: CommonLogContext) => {
    const { planCode, policyNumber } = policyInputs;
    const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/deliverydatesetup`;
    const body = {
      correlationId: loggingCtx.correlationId,
      acknowledgementDate: new Date().toISOString(),
      documentType: POLICY_ACKNOWLEDGEMENT_DOC_TYPE,
    };

    const rawResponse = await ServerApi.post(
      url,
      JSON.stringify(body),
      {
        headers: { 'Content-Type': 'application/json' },
      },
      loggingCtx
    );

    const response = await parseAPIResponse(rawResponse);

    if (rawResponse.status > 400) {
      throw new Error('Error resetting delivery date', {
        cause: {
          details: await logApiNotOkDetails({
            rawResponse,
            parsedResponse: response,
          }),
        },
      });
    }

    return transformEligibility(response);
  },
  { file: FILE_NAME, functionName: 'postResetDeliveryDate' }
);
