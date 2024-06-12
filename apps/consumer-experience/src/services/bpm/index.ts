import dayjs from 'dayjs';

import { ApiEndpoints } from '@/components/dev-menu/types';
import { PolicyRequestInputs } from '@/types/policy';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { ZAHARA_DATE_FORMAT } from '@/utils/dates';
import { logError, logTrace } from '@/utils/logging/server-logging';

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

export const getLoanEligibility = async (options: PolicyRequestInputs) => {
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
