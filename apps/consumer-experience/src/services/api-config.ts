import { cookies } from 'next/headers';

import { ApiEndpoints } from '@/components/dev-menu/types';
import { isMockAllowed } from '@/utils';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';
import {
  MOCK_ANNUITY_COOKIE_KEY,
  MOCK_COOKIE_KEY,
  SHOW_TEST_POLICIES_COOKIE_KEY,
} from '@/utils/serverClientUtils';

import { getFeatureFlags } from './feature-flags';

export const apiVersion = 'v1';
export const AUDIENCE = process.env.NEXT_PUBLIC_BACKEND_URL;
export const baseAppUrl = process.env.NEXT_PUBLIC_BASE_URL;
export const apiServerBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
export const apiServerUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/${apiVersion}`;
export const policyApiBaseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/policy/${apiVersion}/policies`;
// Used for notifications and terms and conditions acknowledgement
export const consumerExperienceAPIBaseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/consumer-experience/v1`;
export const enterprisePolicySearchBaseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/enterprise-search/v1`;
export const productRateBaseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/product-rate/v1/carriers`;
export const enterpriseCaseSearchBaseUrl = enterprisePolicySearchBaseUrl;
export const caseManagementBaseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/case/v1/cases`;
export const documentV2ApiBaseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/document/v2`;
export const documentV3ApiBaseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/document/v3`;

/**
 * BPM returns 400 when a transaction fails the BPM rules. The return should include
 * the status: failure and a rule and reason that the transaction failed
 */
// TODO: update BPM url to the new one
// this is the newer version of the BPM API -- this will not exist in production until Farmers release
export const transactionApiBaseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/policy/v1/transactions`;
// this is the older version of the transactions API
export const bpmApiBaseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/bpm/v1/policies`;

/**
 * Preference API returns a 404 when a user's preference does not exist
 * this does not indicicate an api failure, but rather that the preference
 * is not in the database for that user.
 * When logging a 404 for this API, we should treat the request as a success
 * i.e. do not throw a logError
 */
export const preferencesBaseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/preferences/v1`;
export const aggregationBaseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/aggregation/v1`;

export const transactionsAPIUrl = async () => {
  const flags = await getFeatureFlags();

  return flags?.[FEATURE_FLAGS.UPDATED_TRANSACTION_URL]
    ? transactionApiBaseUrl
    : bpmApiBaseUrl;
};

const getMockParam = () => {
  const cookieStore = cookies();
  return cookieStore.get(MOCK_COOKIE_KEY)?.value;
};

const getMockErrorParam = () => {
  const cookieStore = cookies();

  return cookieStore.get('..mock_error..')?.value;
};

export const isMockErrorEnabled = (endpoint: ApiEndpoints) => {
  if (!isMockAllowed()) {
    return false;
  }

  const mockErrorVals = getMockErrorParam();

  if (!mockErrorVals) {
    return false;
  }

  return JSON.parse(mockErrorVals).includes(endpoint);
};

export const isMockAllRequestEnabled = (val?: boolean) => {
  if (!isMockAllowed()) {
    return false;
  }

  if (val !== undefined) {
    return val;
  }

  return (
    getMockParam() === 'on' ||
    process.env.NEXT_PUBLIC_MOCK_API_REQUEST === 'true'
  );
};

export const isTestPoliciesEnabled = () => {
  if (!isMockAllowed()) {
    return false;
  }

  return cookies().get(SHOW_TEST_POLICIES_COOKIE_KEY)?.value === 'on';
};

export const isMockSearchRequestEnabled = () => {
  if (!isMockAllowed()) {
    return false;
  }

  return getMockParam()?.includes('search') || isMockAllRequestEnabled();
};

export const isMockPolicyOverviewRequestEnabled = () => {
  if (!isMockAllowed()) {
    return false;
  }

  return (
    getMockParam()?.includes('policyOverview') || isMockAllRequestEnabled()
  );
};

export const isMockPaymentHistoryRequestEnabled = () => {
  if (!isMockAllowed()) {
    return false;
  }

  return (
    getMockParam()?.includes('paymentHistory') || isMockAllRequestEnabled()
  );
};
export const isMockPolicyMetricsRequestEnabled = () => {
  if (!isMockAllowed()) {
    return false;
  }

  return getMockParam()?.includes('policyMetrics') || isMockAllRequestEnabled();
};

export const isMockDocumentRequestEnabled = () => {
  if (!isMockAllowed()) {
    return false;
  }

  return getMockParam()?.includes('documents') || isMockAllRequestEnabled();
};

export const isMockRidersRequestEnabled = () => {
  if (!isMockAllowed()) {
    return false;
  }

  return getMockParam()?.includes('riders') || isMockAllRequestEnabled();
};

export const isMockDocumentsRequestEnabled = () => {
  if (!isMockAllowed()) {
    return false;
  }

  return getMockParam()?.includes('documents') || isMockAllRequestEnabled();
};

export const isTestAnnuitiesEnabled = () => {
  if (!isMockAllowed()) {
    return false;
  }
  return cookies().get(MOCK_ANNUITY_COOKIE_KEY)?.value === 'on';
};
