'use server';
import {
  OneTimePremiumRequest,
  PaymentForm,
} from '@zinnia/api-types/types/bpm';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

import { ApiEndpoints } from '@/components/dev-menu/types';
import { PolicyRequestInputs } from '@/types/policy';
import { TransactionEligbility } from '@/types/transactions';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { getSession } from '@/utils/auth';
import { POLICY_ACKNOWLEDGEMENT_DOC_TYPE } from '@/utils/data';
import { ZAHARA_DATE_FORMAT } from '@/utils/dates';
import { logError, logTrace, logWarn } from '@/utils/logging/log-fns';
import { CommonLogContext } from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';

import { ApiResponse } from '..';
import { transformEligibility } from './transformers';
import {
  bpmApiBaseUrl,
  isMockErrorEnabled,
  transactionsAPIUrl,
} from '../api-config';
import { ServerApi } from '../server-http';
import { BpmErrorResponse, BpmSuccessResponse } from './types';

const FILE_NAME = '/src/services/bpm/index.ts';

export const getOneTimeWithdrawalEligibility = async (
  options: PolicyRequestInputs
) => {
  const { planCode, policyNumber } = options;
  const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/partialwithdrawalonetime/eligibilitycheck`;
  if (isMockErrorEnabled(ApiEndpoints.WITHDRAWAL_ELIGIBILITY)) {
    throw new Error('Error fetching withdrawal eligibility.');
  }

  const rawResponse = await ServerApi.post(
    url,
    JSON.stringify({ effectiveDate: dayjs().format(ZAHARA_DATE_FORMAT) }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  const response = await parseAPIResponse(rawResponse);
  // This endpoint returns 400 "not found" when the policy is not eligible withdrawals
  if (rawResponse.status > 400) {
    logError(
      'Error fetching withdrawal eligibility',
      await logApiNotOkDetails({ rawResponse, parsedResponse: response })
    );

    throw new Error('Error fetching OneTimeWithdrawalEligibility');
  }

  if (rawResponse.status === 400) {
    logTrace('Withdrawal ineligible reason', {
      results: response?.validationResult,
    });
  }

  return response;
};

export const getPolicyLoanEligibility = async (
  options: PolicyRequestInputs
) => {
  const { planCode, policyNumber } = options;
  const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/newloan/eligibilitycheck`;
  if (isMockErrorEnabled(ApiEndpoints.WITHDRAWAL_ELIGIBILITY)) {
    throw new Error('Error fetching loan eligibility.');
  }

  const rawResponse = await ServerApi.post(url, JSON.stringify({}), {
    headers: { 'Content-Type': 'application/json' },
  });

  const response = await parseAPIResponse(rawResponse);

  // This endpoint returns 400 "not found" when the policy is not eligible withdrawals
  if (rawResponse.status > 400) {
    logError(
      'Error fetching loan eligibility',
      await logApiNotOkDetails({ rawResponse, parsedResponse: response })
    );

    throw new Error('Error fetching PolicyLoanEligibility');
  }

  if (rawResponse.status === 400) {
    logTrace('loan ineligible reason', {
      results: response?.validationResult,
    });
  }

  return response;
};

export const getOneTimePremiumEligibility = async (
  options: PolicyRequestInputs
) => {
  const { planCode, policyNumber } = options;
  const url = `${await transactionsAPIUrl()}/${planCode}/${policyNumber}/onetimepremium/eligibilitycheck`;

  const rawResponse = await ServerApi.post(url, JSON.stringify({}), {
    headers: { 'Content-Type': 'application/json' },
  });

  const response = await parseAPIResponse(rawResponse);

  // This endpoint returns 400 "not found" when the policy is not eligible withdrawals
  if (rawResponse.status > 400) {
    logError(
      'Error fetching one time premium eligibility',
      await logApiNotOkDetails({ rawResponse, parsedResponse: response })
    );

    throw new Error('Error fetching PolicyLoanEligibility');
  }

  if (rawResponse.status === 400) {
    logTrace('one time premium ineligible reason', {
      results: response?.validationResult,
    });
  }

  return response;
};

export const getOneTimePremiumValidation = withLogging(
  async (
    options: PolicyRequestInputs,
    ottpRequestDetails: OneTimePremiumRequest,
    loggingContext: CommonLogContext
  ) => {
    const session = await getSession();
    const partyId = session?.user?.partyId;
    const { planCode, policyNumber } = options;
    const url = `${await transactionsAPIUrl()}/${planCode}/${policyNumber}/onetimepremium/validation`;

    const payorPartyId = ottpRequestDetails.payor?.partyId || partyId;
    const requestDetails = {
      ...ottpRequestDetails,

      // TODO: eventually the aggregation API will return appliesToPartyId which will make
      // this unnecessary. Unfortunately the partyId returned in auth (so from session above)
      // is only included in policy details for certain carriers (e.g. farmers)
      // for other carriers (e.g. everly, wellabe) partyId on the poliyc
      // is the enterprise partyId not the auth partyId
      payor: {
        ...ottpRequestDetails.payor,
        partyId: payorPartyId,
        // Hardcode ACH here because the one time premium submission takes in the accountType from the bank
        // detail as the paymentForm to account for third party payment methods, but this endpoint
        // has not been updated to handle that as of 07/31/25
        paymentForm: PaymentForm.ACH,
      },
    };

    const rawResponse = await ServerApi.post(
      url,
      JSON.stringify(requestDetails),
      {
        headers: { 'Content-Type': 'application/json' },
      },
      loggingContext
    );

    const response = await parseAPIResponse(rawResponse);

    // This endpoint returns 400 "not found" when the policy is not eligible withdrawals
    if (rawResponse.status > 400) {
      logError(
        'Error fetching one time premium validation',
        await logApiNotOkDetails({ rawResponse, parsedResponse: response })
      );

      throw new Error('Error fetching PolicyLoanEligibility');
    }

    if (rawResponse.status === 400) {
      logTrace('one time premium ineligible reason', {
        results: response?.validationResult,
      });
    }

    return transformEligibility(response);
  },
  { file: FILE_NAME, functionName: 'getOneTimePremiumValidation' }
);

export const submitOneTimePremiumPayment = withLogging(
  async (
    options: PolicyRequestInputs,
    paymentDetails: OneTimePremiumRequest,
    loggingCtx: CommonLogContext
  ) => {
    if (isMockErrorEnabled(ApiEndpoints.ONE_TIME_PREMIUM_PAYMENT)) {
      throw new Error('Error making one time premium payment.');
    }
    const session = await getSession();
    const partyId = session?.user?.partyId;

    const { planCode, policyNumber } = options;
    const url = `${await transactionsAPIUrl()}/${planCode}/${policyNumber}/onetimepremium`;

    const payorPartyId = paymentDetails?.payor?.partyId || partyId;
    const submitDetails = {
      ...paymentDetails,
      // TODO: eventually the aggregation API will return appliesToPartyId which will make
      // this unnecessary. Unfortunately the partyId returned in auth (so from session above)
      // is only included in policy details for certain carriers (e.g. farmers)
      // for other carriers (e.g. everly, wellabe) partyId on the poliyc
      // is the enterprise partyId not the auth partyId
      payor: { ...paymentDetails.payor, partyId: payorPartyId },
    };

    const rawResponse = await ServerApi.post(
      url,
      JSON.stringify(submitDetails),
      {
        headers: { 'Content-Type': 'application/json' },
      },
      loggingCtx
    );

    const response = await parseAPIResponse(rawResponse);

    // TODO: I think this should be only throwing an error if the status is
    // above a 400
    if (!rawResponse?.ok) {
      const moreDetails = await logApiNotOkDetails({
        rawResponse,
        parsedResponse: response,
      });

      throw new Error('Error submitting one time premium.', {
        cause: {
          status: rawResponse.status,
          name: 'submitOneTimePremiumPayment Error',
          message: response.message,
          ...moreDetails,
          submissionDetails: submitDetails,
        },
      });
    }

    return response;
  },
  { file: FILE_NAME, functionName: 'submitOneTimePremiumPayment' }
);

export const getWithdrawalEligibility = async (
  policyInputs: PolicyRequestInputs
): Promise<ApiResponse<TransactionEligbility>> => {
  logTrace('getWithdrawalEligibility::start', {
    planCode: policyInputs.planCode,
    policyNumber: policyInputs.policyNumber,
  });

  try {
    const policyWithdrawalEligibility =
      await getOneTimeWithdrawalEligibility(policyInputs);

    return {
      data: transformEligibility(policyWithdrawalEligibility),
      error: null,
    };
  } catch (error) {
    logWarn('getWithdrawalEligibility::error', { error });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'getWithdrawalEligibility Error',
      },
    };
  }
};

export const getLoanEligibility = async (
  policyInputs: PolicyRequestInputs
): Promise<ApiResponse<TransactionEligbility>> => {
  logTrace('getLoanEligibility::start', {
    planCode: policyInputs.planCode,
    policyNumber: policyInputs.policyNumber,
  });

  try {
    const policyLoanEligibility = await getPolicyLoanEligibility(policyInputs);

    return {
      data: transformEligibility(policyLoanEligibility),
      error: null,
    };
  } catch (error) {
    logWarn('getWithdrawalEligibility::error', { error });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'getWithdrawalEligibility Error',
      },
    };
  }
};

export const getPremiumEligibility = async (
  policyInputs: PolicyRequestInputs
): Promise<ApiResponse<TransactionEligbility>> => {
  logTrace('getPremiumEligibility::start', {
    planCode: policyInputs.planCode,
    policyNumber: policyInputs.policyNumber,
  });

  try {
    const ottpEligibility = await getOneTimePremiumEligibility(policyInputs);

    return {
      data: transformEligibility(ottpEligibility),
      error: null,
    };
  } catch (error) {
    logWarn('getPremiumEligibility::error', { error });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'getPremiumEligibility Error',
      },
    };
  }
};

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
