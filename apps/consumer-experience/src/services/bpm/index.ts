'use server';
import { v4 as uuidv4 } from 'uuid';

import { PolicyRequestInputs } from '@/types/policy';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { POLICY_ACKNOWLEDGEMENT_DOC_TYPE } from '@/utils/data';
import { logError, logTrace } from '@/utils/logging/log-fns';

import { bpmApiBaseUrl } from '../api-config';
import { ServerApi } from '../server-http';
import { BpmErrorResponse, BpmSuccessResponse } from './types';

const FILE_NAME = '/src/services/bpm/index.ts';

export const checkResetDeliveryDateEligibility = async (
  policyInputs: PolicyRequestInputs
) => {
  const { planCode, policyNumber } = policyInputs;
  const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/deliverydatesetup/eligibilitycheck`;
  const body = {
    correlationId: uuidv4(),
    documentType: POLICY_ACKNOWLEDGEMENT_DOC_TYPE,
  };

  const rawResponse = await ServerApi.post(url, JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
  });
  const response: BpmSuccessResponse | BpmErrorResponse =
    await parseAPIResponse(rawResponse);

  if (rawResponse.status > 400) {
    // There was lots of back and forth with BPM about this. They are checking partyId (from our accessToken) is inside the preferences API.
    // Currently BPM is returning a 404 if a partyId is not found in the preferences api. We asked them to return a 400 like the
    // other validation checks, but were told that until other use cases for this exist, this is what we get.

    // TODO: Once BPM fixes this, we should update this so that we send the logError for anything over 400.
    if (rawResponse.status !== 404) {
      logError(
        'Error fetching reset delivery date eligibility',
        await logApiNotOkDetails({ rawResponse, parsedResponse: response })
      );
    }

    return {
      data: {
        isEligible: false,
        policyNumber,
        planCode,
      },
      error: null,
    };
  }

  if (rawResponse.status === 400) {
    logTrace('ResetDeliveryDate ineligible reason', {
      results: (response as BpmErrorResponse)?.validationResult,
    });
    return {
      data: {
        isEligible: false,
        policyNumber,
        planCode,
        reasons: (response as BpmErrorResponse)?.validationResult,
      },
      error: null,
    };
  }

  return {
    data: {
      isEligible: true,
      policyNumber,
      planCode,
      reasons: [],
    },
    error: null,
  };
};

export const postResetDeliveryDate = async (
  policyInputs: PolicyRequestInputs
) => {
  const { planCode, policyNumber } = policyInputs;
  const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/deliverydatesetup`;
  const body = {
    correlationId: uuidv4(),
    acknowledgementDate: new Date().toISOString(),
    documentType: POLICY_ACKNOWLEDGEMENT_DOC_TYPE,
  };

  const rawResponse = await ServerApi.post(url, JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
  });

  const response = await parseAPIResponse(rawResponse);

  if (rawResponse.status >= 400) {
    logError(
      'Error resetting delivery date',
      await logApiNotOkDetails({ rawResponse, parsedResponse: response })
    );
  }

  // This endpoint will return a 400 if its ineligible.
  // This generally shouldn't be an issue because we check the eligibility before we hit this endpoint
  if (rawResponse.status === 400) {
    logTrace('ResetDeliveryDate ineligible reason', {
      results: (response as BpmErrorResponse)?.validationResult,
    });
    return {
      data: {
        isEligible: false,
        reasons: (response as BpmErrorResponse)?.validationResult,
      },
      error: null,
    };
  }

  return {
    data: response,
    error: null,
  };
};
