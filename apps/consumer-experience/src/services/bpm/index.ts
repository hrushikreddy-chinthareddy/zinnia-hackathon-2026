'use server';
import {
  PartialWithdrawalOneTimeRequest,
  TransactionFailureResponse,
  TransactionResponse,
} from '@xd/api-types/dist/generated-types/bpm';
import { OneTimePremiumRequest } from '@zinnia/api-types/types/bpm';
import dayjs from 'dayjs';
import { CLIENT_STATIC_FILES_RUNTIME_REACT_REFRESH } from 'next/dist/shared/lib/constants';
import { v4 as uuidv4 } from 'uuid';

import { ApiEndpoints } from '@/components/dev-menu/types';
import { WithdrawalsState } from '@/components/providers/withdrawals/types';
import {
  PolicyRequestInputs,
} from '@/types/policy';
import { TransactionEligbility } from '@/types/transactions';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { POLICY_ACKNOWLEDGEMENT_DOC_TYPE } from '@/utils/data';
import { ZAHARA_DATE_FORMAT } from '@/utils/dates';
import {
  CommonLogContext,
  logError,
  logTrace,
  logWarn,
} from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';
import { UniformServiceResponse } from '@/utils/serverClientUtils';

import { ApiResponse } from '..';
import {
  transformEligibility,
  withdrawalStateToPolicyRequestInput,
} from './transformers';
import { bpmApiBaseUrl, isMockErrorEnabled } from '../api-config';
import { ServerApi } from '../server-http';
import { BpmErrorResponse, BpmSuccessResponse } from './types';

const FILE_NAME = 'bpm/index.ts';

type PWOTWithdrawalBPMSucessResponse = {
  status: TransactionResponse.status.SUCCESS;
} & TransactionResponse;

type PWOTWithdrawalBPMErrorResponse = {
  status: TransactionFailureResponse.status.FAILURE;
} & TransactionFailureResponse;

type PwotWithdrawalBPMResponse =
  | PWOTWithdrawalBPMSucessResponse
  | PWOTWithdrawalBPMErrorResponse;

export const getOneTimeWithdrawalEligibility = withLogging<
[PolicyRequestInputs], PwotWithdrawalBPMResponse>(
  async (options: PolicyRequestInputs, loggingCtx: CommonLogContext) => {
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
      },
      loggingCtx
    );

    const response: PwotWithdrawalBPMResponse =
      await parseAPIResponse(rawResponse);
    // This endpoint returns 400 "not found" when the policy is not eligible withdrawals
    if (rawResponse.status > 400) {
      logError(
        'Error fetching withdrawal eligibility',
        await logApiNotOkDetails({ rawResponse, parsedResponse: response })
      );

      throw new Error('Error fetching OneTimeWithdrawalEligibility');
    }

    if (rawResponse.status === 400 && response.status === 'failure') {
      logTrace('Withdrawal ineligible reason', {
        results: response?.validationResult,
      });
    }

    return response;
  },
  {
    file: FILE_NAME,
    functionName: 'getOneTimeWithdrawalEligibility',
  }
);

export const getOneTimeWithdrawalValidation = withLogging<
  [PolicyRequestInputs, PartialWithdrawalOneTimeRequest],
  TransactionResponse
>(
  async (
    options: PolicyRequestInputs,
    pwotRequestDetails: PartialWithdrawalOneTimeRequest,
    loggingCtx: CommonLogContext
  ) => {
    const { planCode, policyNumber } = options;
    const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/partialwithdrawalonetime/validation`;

    const rawResponse = await ServerApi.post(
      url,
      JSON.stringify(pwotRequestDetails),
      {
        headers: { 'Content-Type': 'application/json' },
      },
      loggingCtx
    );

    const response: PwotWithdrawalBPMResponse =
      await parseAPIResponse(rawResponse);

    // This endpoint returns 400 "not found" when the policy is not eligible withdrawals
    if (
      rawResponse.status > 400 &&
      response.status === TransactionFailureResponse.status.FAILURE
    ) {
      console.error({ rawResponse, response });
      logError(
        'Error fetching one time withdrawal validation',
        await logApiNotOkDetails({ rawResponse, parsedResponse: response })
      );

      throw new Error('Error fetching PolicyLoanEligibility');
    }

    if (
      rawResponse.status === 400 &&
      response.status === TransactionFailureResponse.status.FAILURE
    ) {
      logTrace('one time premium ineligible reason', {
        results: response?.validationResult,
      });
    }

    return response;
  },
  {
    file: CLIENT_STATIC_FILES_RUNTIME_REACT_REFRESH,
    functionName: 'getOneTimeWithdrawalValidation',
  }
);

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
  const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/onetimepremium/eligibilitycheck`;
  // if (isMockErrorEnabled(ApiEndpoints.WITHDRAWAL_ELIGIBILITY)) {
  //   throw new Error('Error fetching loan eligibility.');
  // }

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

export const getOneTimePremiumValidation = async (
  options: PolicyRequestInputs,
  ottpRequestDetails: OneTimePremiumRequest
) => {
  const { planCode, policyNumber } = options;
  const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/onetimepremium/validation`;
  // if (isMockErrorEnabled(ApiEndpoints.WITHDRAWAL_ELIGIBILITY)) {
  //   throw new Error('Error fetching loan eligibility.');
  // }

  const rawResponse = await ServerApi.post(
    url,
    JSON.stringify(ottpRequestDetails),
    {
      headers: { 'Content-Type': 'application/json' },
    }
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

  return response;
};

export const submitOneTimePremiumPayment = async (
  options: PolicyRequestInputs,
  paymentDetails: OneTimePremiumRequest
  // TODO: fix return type
) => {
  if (isMockErrorEnabled(ApiEndpoints.ONE_TIME_PREMIUM_PAYMENT)) {
    throw new Error('Error making one time premium payment.');
  }

  const { planCode, policyNumber } = options;
  const url = `${bpmApiBaseUrl}/${planCode}/${policyNumber}/onetimepremium`;

  const rawResponse = await ServerApi.post(
    url,
    JSON.stringify(paymentDetails),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  const response = await parseAPIResponse(rawResponse);

  if (!rawResponse?.ok) {
    logError(
      'Error submitting one time premium payment',
      await logApiNotOkDetails({ rawResponse, parsedResponse: response })
    );

    throw new Error('Error fetching policy.', {
      cause: {
        status: rawResponse.status,
        name: 'submitOneTimePremiumPayment Error',
        message: response.message,
      },
    });
  }

  return response;
};

export const getWithdrawalValidation = withLogging(
  async (
    policyInputs: PolicyRequestInputs,
    pwotRequestDetails: WithdrawalsState,
    loggingCtx: CommonLogContext
  ) => {
    logTrace('getWithdrawalValidation::start', {
      planCode: policyInputs.planCode,
      policyNumber: policyInputs.policyNumber,
    });

    const parsedInput = withdrawalStateToPolicyRequestInput(pwotRequestDetails, loggingCtx.correlationId);

    try {
      const response = await getOneTimeWithdrawalValidation(
        policyInputs,
        parsedInput,
        loggingCtx
      );
      
      if (response.error) {
        throw response.error;
      }

      return response;
    } catch (error) {
      logWarn('getWithdrawalValidation::error', { error });

      return {
        data: null,
        error: {
          message: 'Something went wrong',
          status: 500,
          name: 'getWithdrawalValidation Error',
        },
      };
    }
  },
  {
    file: FILE_NAME,
    functionName: 'getWithdrawalValidation',
  }
);

type WithdrawalEligibilityResponse = UniformServiceResponse<TransactionEligbility>;

export const getWithdrawalEligibility = withLogging<
  [PolicyRequestInputs],
  WithdrawalEligibilityResponse
>(async (
  policyInputs: PolicyRequestInputs,
  loggingCtx: CommonLogContext
) => {
  logTrace('getWithdrawalEligibility::start', {
    planCode: policyInputs.planCode,
    policyNumber: policyInputs.policyNumber,
  });

  try {
    const {data, error} =
      await getOneTimeWithdrawalEligibility(policyInputs, loggingCtx);

      if(!data || data.status !== TransactionFailureResponse.status.SUCCESS) {
        throw error || new Error('No data returned from BPM');
      }

      const parsedData = transformEligibility(data)

      return {
        data: parsedData,
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
}, {
  file: FILE_NAME,
  functionName: 'getWithdrawalEligibility',
});

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

export const getPremiumValidation = async (
  policyInputs: PolicyRequestInputs,
  ottpRequestDetails: OneTimePremiumRequest
): Promise<ApiResponse<TransactionEligbility>> => {
  logTrace('getPremiumValidation::start', {
    planCode: policyInputs.planCode,
    policyNumber: policyInputs.policyNumber,
  });

  try {
    const ottpValidation = await getOneTimePremiumValidation(
      policyInputs,
      ottpRequestDetails
    );

    return {
      data: transformEligibility(ottpValidation),
      error: null,
    };
  } catch (error) {
    logWarn('getPremiumValidation::error', { error });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'getPremiumValidation Error',
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
