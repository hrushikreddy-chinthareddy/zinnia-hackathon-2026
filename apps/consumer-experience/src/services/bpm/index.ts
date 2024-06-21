import dayjs from 'dayjs';

import { ApiEndpoints } from '@/components/dev-menu/types';
import { PolicyRequestInputs } from '@/types/policy';
import { TransactionEligbility } from '@/types/transactions';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { ZAHARA_DATE_FORMAT } from '@/utils/dates';
import { logError, logTrace, logWarn } from '@/utils/logging/server-logging';

import { transformEligibility } from './transformers';
import { ApiResponse } from '..';
import { bpmApiBaseUrl, isMockErrorEnabled } from '../api-config';
import { ServerApi } from '../server-http';

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
  if (rawResponse.status !== 200 && rawResponse.status !== 400) {
    logError(
      'Error fetching withdrawal eligibility',
      await logApiNotOkDetails({ rawResponse, parsedResponse: response })
    );
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
  if (rawResponse.status !== 200 && rawResponse.status !== 400) {
    logError(
      'Error fetching loan eligibility',
      await logApiNotOkDetails({ rawResponse, parsedResponse: response })
    );
  }

  if (rawResponse.status === 400) {
    logTrace('loan ineligible reason', {
      results: response?.validationResult,
    });
  }

  return response;
};

export const getWithdrawalEligibility = async (
  policyInputs: PolicyRequestInputs
): Promise<ApiResponse<TransactionEligbility>> => {
  logTrace('getPolicyWithdrawalDetails::start', {
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
  logTrace('getPolicyWithdrawalDetails::start', {
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
