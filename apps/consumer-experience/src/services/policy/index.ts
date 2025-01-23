import { PolicySearchRequest } from '@zinnia/api-types/types/search';
import {
  Policy,
  Transaction,
  TransactionErrorResponse,
  MetricsType,
  PolicyStatus,
  BankAccount,
} from '@zinnia/api-types/types/sor';
import { policyOwner } from '@zinnia/utils';
import dayjs from 'dayjs';

import { ApiEndpoints } from '@/components/dev-menu/types';
import { BankDetail } from '@/components/person-data/types';
import {
  ApiResponse,
  ServerApi,
  isMockErrorEnabled,
  isMockPaymentHistoryRequestEnabled,
  isMockPolicyMetricsRequestEnabled,
  isMockPolicyOverviewRequestEnabled,
  isMockRidersRequestEnabled,
  isMockSearchRequestEnabled,
  isTestAnnuitiesEnabled,
  isTestPoliciesEnabled,
  policyApiBaseUrl,
} from '@/services';
import { mockPolicyResponse } from '@/services/mocks/policy';
import {
  transformPolicyReferenceData,
  transformPolicyForProfile,
  transformPolicyForUpcomingPremium,
  transformPolicyForCoverage,
  transformPolicyForHeaderDetails,
  transformPolicyForAccountValue,
  transformPolicyForBeneficiaries,
  transformPolicyForBeneficiary,
  transformPolicyforPaymentDetails,
  transformPaymentHistory,
  transformPolicyMetricsForAccountValueChange,
  transformPolicyForFundDetails,
  transformRiders,
  transformPolicyForWithdrawals,
  transformPolicyForLoans,
  transformPolicyForSurrender,
  transformPolicyStatusDetails,
  transformPolicyDetails,
  sortPoliciesByIssuedDate,
} from '@/services/policy/transformers';
import {
  PolicyApiResponse,
  PolicyProfile,
  PolicyReferenceData,
  PolicyRequestInputs,
  UpcomingPremium,
  PolicyCoverage,
  PolicyDetails,
  PolicyAccountValue,
  BeneficiaryData,
  BeneficiaryRequestInputs,
  Beneficiary,
  TransactionRequestInputs,
  CompletedPremiumTransactionType,
  PendingPremiumTransactionType,
  PaymentHistoryTransaction,
  PolicyMetricsRequestInputs,
  PolicyFund,
  PolicyWithdrawals,
  PolicyLoans,
  PolicySurrender,
  CarrierPolicyDetails,
  CompletedAnnuityTransactionType,
  PendingAnnuityTransactionType,
} from '@/types/policy';
import { RidersAndBenefits } from '@/types/riders';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { logError, logTrace, logWarn } from '@/utils/logging/server-logging';

import { mockAnnuityResponse } from '../mocks/annuity';
import { MockMetricsResponse } from '../mocks/metrics';
import {
  mockCompletedTransactions,
  mockPendingTransactions,
} from '../mocks/transactions';

/**
 * Returns error object that occur while fetching policy data from an API.
 *
 * @param {Response} rawResponse - The raw response object received from the API call.
 * @param {unknown} parsedResponse - The parsed response object obtained from the API call.
 * @return {Object} An object containing apiMessage, statusText, statusCode, url, and sessionInfo.
 */

const getPolicyReferencesByCarrier = async () => {
  const searchUrl = `${policyApiBaseUrl}/search?offset=0&limit=100`;
  const searchFilter: PolicySearchRequest = {};

  if (isTestPoliciesEnabled()) {
    // @ts-expect-error specs aren't updated in developer portal yet
    searchFilter['carrierIds'] = ['SBUL'];
  }

  if (isMockErrorEnabled(ApiEndpoints.POLICY_BY_CARRIERS)) {
    throw new Error('Error fetching policies by carrier.');
  }

  const rawResponse = await ServerApi.post(
    searchUrl,
    JSON.stringify(searchFilter),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  const response = await parseAPIResponse(rawResponse);

  if (!rawResponse?.ok) {
    logError(
      'Error fetching policy search results',
      await logApiNotOkDetails({ rawResponse, parsedResponse: response })
    );

    throw new Error('Error fetching policy references');
  }

  return response;
};

export const getPolicyByPlanCodeAndId = async (
  options: PolicyRequestInputs
) => {
  const { planCode, policyNumber } = options;
  const url = `${policyApiBaseUrl}/${planCode}/${policyNumber}?viewDetails=true`;
  if (isMockErrorEnabled(ApiEndpoints.POLICY)) {
    throw new Error('Error fetching policy.');
  }

  const rawResponse = await ServerApi.get(url);
  const response = await parseAPIResponse(rawResponse);

  if (!rawResponse?.ok) {
    logError(
      'Error fetching policy',
      await logApiNotOkDetails({ rawResponse, parsedResponse: response })
    );

    throw new Error('Error fetching policy.', {
      cause: policyNumber,
    });
  }

  const { data } = response as PolicyApiResponse<Policy>;

  if (!data) {
    logError(
      'Policy API response returned with no data',
      await logApiNotOkDetails({ rawResponse, parsedResponse: response })
    );

    throw new Error('Error fetching policy.', {
      cause: policyNumber,
    });
  }

  return data;
};

/**
 * Retrieves the bank details associated with a policy based on its plan code and policy number.
 *
 * @param {PolicyRequestInputs} options - The options object containing the plan code and policy number.
 * @return {Promise<BankDetail[] | undefined>} - A promise that resolves to an array of bank details, or undefined if the policy owner has no bank details.
 *
 * DO NOT USE THIS ON FRONTEND. This returns the full accountNumber. There is another method that retreives sanitized bank accounts.
 */
export const getUnsanitizedBanksByPolicyPlanCodeAndId = async (
  options: PolicyRequestInputs
): Promise<BankAccount[] | undefined> => {
  const { planCode, policyNumber } = options;
  const policy = await getPolicyByPlanCodeAndId({
    planCode,
    policyNumber,
  });

  return policyOwner(policy)?.bankDetails;
};

const getPolicyTransactions = async ({
  transactionTypes,
  policyNumber,
  limit = 10,
  offset = 0,
  order = 'ASC',
  planCode,
  status,
  year,
}: TransactionRequestInputs) => {
  let query = `?offset=${offset}&limit=${limit}&order=${order}&status=${status}`;
  if (transactionTypes.length) {
    query =
      query +
      `&${transactionTypes.map(transactionType => `transactionTypes=${transactionType}`).join('&')}`;
  }

  if (year) {
    query = `${query}&startDate=${year}-01-01&endDate=${year}-12-31`;
  }

  const url = `${policyApiBaseUrl}/${planCode}/${policyNumber}/transactions${query}`;

  if (isMockErrorEnabled(ApiEndpoints.TRANSACTIONS)) {
    throw new Error('Error fetching transactions.');
  }

  const rawResponse = await ServerApi.get(url);
  const response = (await parseAPIResponse(rawResponse)) as
    | TransactionErrorResponse
    | PolicyApiResponse<Transaction[]>;

  if (!rawResponse?.ok) {
    logWarn(
      'Error fetching policy transactions',
      await logApiNotOkDetails({ rawResponse, parsedResponse: response })
    );

    throw new Error('Error fetching policy transactions');
  }

  return (response as PolicyApiResponse<Transaction[]>).data;
};

const getPolicyMetrics = async (
  options: PolicyRequestInputs,
  metrics: PolicyMetricsRequestInputs
) => {
  const { planCode, policyNumber } = options;
  const url = `${policyApiBaseUrl}/${planCode}/${policyNumber}/metrics`;

  if (isMockErrorEnabled(ApiEndpoints.METRICS)) {
    throw new Error('Error fetching metrics.');
  }

  const rawResponse = await ServerApi.post(url, JSON.stringify(metrics), {
    headers: { 'Content-Type': 'application/json' },
  });

  const response = await parseAPIResponse(rawResponse);

  if (!rawResponse?.ok) {
    logWarn(
      'Error fetching policy metrics',
      await logApiNotOkDetails({ rawResponse, parsedResponse: response })
    );

    throw new Error('Error fetching metrics', { cause: response.status });
  }

  return response.data;
};

export const getMyPoliciesByCarrier = async (
  carrierId: string[] | string
): Promise<ApiResponse<CarrierPolicyDetails[]>> => {
  logTrace('called getMyPoliciesByCarrier', { carrierId });

  if (isMockSearchRequestEnabled()) {
    const product = isTestAnnuitiesEnabled()
      ? mockAnnuityResponse
      : mockPolicyResponse;
    const transformedResults = transformPolicyReferenceData([product]);

    return {
      data: transformedResults,
      error: null,
    };
  }

  try {
    const response = await getPolicyReferencesByCarrier();
    if (!response.results) {
      throw new Error('API response results did not exist on the response.');
    }

    const filteredPolicies = response.results
      .filter((p: Policy) => carrierId.includes(p.carrierId || ''))
      .map((carrierPolicy: PolicyReferenceData) => {
        return getPolicyByPlanCodeAndId({
          planCode: carrierPolicy.planCode || '',
          policyNumber: carrierPolicy.policyNumber,
        });
      });

    const allPolicyDataSettledResult =
      await Promise.allSettled<Policy>(filteredPolicies);
    const hasFulfilledPolicy = allPolicyDataSettledResult.some(
      a => a.status === 'fulfilled'
    );

    if (!hasFulfilledPolicy) {
      throw new Error('All requests to get policy data failed');
    }

    const allPolicyData = allPolicyDataSettledResult.map(p => {
      if (p.status === 'fulfilled') {
        return p.value;
      }

      const policyNumber = p?.reason?.cause;
      const policyReference = response.results.find(
        (r: Policy) => r?.policyNumber === policyNumber
      );

      const policy: Partial<Policy> = {
        product: {
          planCode: policyReference?.planCode,
          marketingName: policyReference?.productName,
        },
        policyNumber: policyReference?.policyNumber,
        policyStatus: policyReference?.policyStatus as PolicyStatus | undefined,
      };
      return policy;
    });

    const transformedResults = transformPolicyReferenceData(allPolicyData);
    const sortedResults = sortPoliciesByIssuedDate(transformedResults);
    return {
      data: sortedResults,
      error: null,
    };
  } catch (error) {
    logWarn('error thrown in getMyPoliciesByCarrier', { error });
    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 400,
        name: 'getMyPoliciesByCarrier Error',
      },
    };
  }
};

export const getPolicyAccountValue = async (
  options: PolicyRequestInputs
): Promise<ApiResponse<PolicyAccountValue>> => {
  logTrace('getPolicyAccountValue', {
    planCode: options.planCode,
    policyNumber: options.policyNumber,
  });

  if (isMockPolicyOverviewRequestEnabled()) {
    const product = isTestAnnuitiesEnabled()
      ? mockAnnuityResponse
      : mockPolicyResponse;
    const transformedResults = transformPolicyForAccountValue(product);

    return {
      data: transformedResults,
      error: null,
    };
  }

  try {
    const response = await getPolicyByPlanCodeAndId(options);
    const transformedResults = transformPolicyForAccountValue(response);
    return {
      data: transformedResults,
      error: null,
    };
  } catch (error) {
    logWarn('getPolicyAccountValue error', { error });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'getPolicyAccountValue Error',
      },
    };
  }
};

export const get30DayAccountValueChange = async (
  options: PolicyRequestInputs
) => {
  if (isMockPolicyMetricsRequestEnabled()) {
    const transformedResults =
      transformPolicyMetricsForAccountValueChange(MockMetricsResponse);

    return {
      data: transformedResults,
      error: null,
    };
  }

  try {
    const response = await getPolicyMetrics(options, {
      startDate: dayjs().subtract(30, 'day').toISOString(),
      endDate: dayjs().toISOString(),
      metrics: [MetricsType.ACCOUNTVALUE],
    });

    const transformedResults =
      transformPolicyMetricsForAccountValueChange(response);

    return {
      data: transformedResults,
      error: null,
    };
  } catch (error) {
    logTrace('get30DayAccountValueChange error', { error });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'get30DayAccountValueChange Error',
      },
    };
  }
};

export const getPolicyAccountValueWith30DayChange = async (
  options: PolicyRequestInputs
): Promise<ApiResponse<PolicyAccountValue>> => {
  logTrace('getPolicyAccountValueWith30DayChange', {
    planCode: options.planCode,
    policyNumber: options.policyNumber,
  });

  const data = await Promise.allSettled([
    getPolicyAccountValue(options),
    get30DayAccountValueChange(options),
  ]);

  const anySuccess = data.filter(item => item.status === 'fulfilled');

  if (!anySuccess) {
    logTrace('getPolicyAccountValueWith30DayChange requests were rejected', {});

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'getPolicyAccountValueWith30DayChange Error',
      },
    };
  }

  // Return error specifically if policy account value fails because the 30day change value
  // is meaningful in conjunction with that value, but not alone
  if (data?.[0].status === 'rejected' || data?.[0].value.error) {
    logTrace('getPolicyAccountValue request was rejected', {
      reason: data[0].status === 'rejected' && data[0].reason,
    });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'getPolicyAccountValueWith30DayChange Error',
      },
    };
  }

  const allData = data.reduce((successData, item) => {
    if (item.status === 'fulfilled' && item.value.data) {
      successData = { ...successData, ...item.value.data };
    }

    return successData;
  }, {});

  return {
    data: allData,
    error: null,
  };
};

// TODO: convert this to just getPolicyDetails
export const getPolicyForHeaderDetails = async (
  options: PolicyRequestInputs
): Promise<ApiResponse<PolicyDetails>> => {
  logTrace('getPolicyForHeaderDetails', {
    planCode: options.planCode,
    policyNumber: options.policyNumber,
  });

  if (isMockPolicyOverviewRequestEnabled()) {
    const product = isTestAnnuitiesEnabled()
      ? mockAnnuityResponse
      : mockPolicyResponse;
    const transformedResults = transformPolicyForHeaderDetails(product);

    return {
      data: transformedResults,
      error: null,
    };
  }

  try {
    const response = await getPolicyByPlanCodeAndId(options);
    const transformedResults = transformPolicyForHeaderDetails(response);
    return {
      data: transformedResults,
      error: null,
    };
  } catch (error) {
    logWarn('getPolicyForHeaderDetails error', { error });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 400,
        name: 'getPolicyForHeaderDetails Error',
      },
    };
  }
};

export const getPolicyProfileData = async (
  options: PolicyRequestInputs
): Promise<ApiResponse<PolicyProfile>> => {
  logTrace('getPolicyProfileData', {
    planCode: options.planCode,
    policyNumber: options.policyNumber,
  });

  if (isMockPolicyOverviewRequestEnabled()) {
    const product = isTestAnnuitiesEnabled()
      ? mockAnnuityResponse
      : mockPolicyResponse;
    const transformedResults = transformPolicyForProfile(product);

    return {
      data: transformedResults,
      error: null,
    };
  }

  try {
    const response = await getPolicyByPlanCodeAndId(options);
    const transformedResults = transformPolicyForProfile(response);

    return {
      data: transformedResults,
      error: null,
    };
  } catch (error) {
    logWarn('getPolicyProfileData error', { error });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 400,
        name: 'getPolicyProfileData Error',
      },
    };
  }
};

export const getUpcomingPremium = async (
  options: PolicyRequestInputs
): Promise<ApiResponse<UpcomingPremium>> => {
  logTrace('getUpcomingPremium', {
    planCode: options.planCode,
    policyNumber: options.policyNumber,
  });

  if (isMockPolicyOverviewRequestEnabled()) {
    const product = isTestAnnuitiesEnabled()
      ? mockAnnuityResponse
      : mockPolicyResponse;
    const transformedResults = transformPolicyForUpcomingPremium(product);

    return {
      data: transformedResults,
      error: null,
    };
  }

  try {
    const response = await getPolicyByPlanCodeAndId(options);
    const transformedResults = transformPolicyForUpcomingPremium(response);
    return {
      data: transformedResults,
      error: null,
    };
  } catch (error) {
    logWarn('getUpcomingPremium error', { error });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 400,
        name: 'getUpcomingPremium Error',
      },
    };
  }
};

export const getCoverage = async (
  options: PolicyRequestInputs
): Promise<ApiResponse<PolicyCoverage>> => {
  logTrace('getCoverage', {
    planCode: options.planCode,
    policyNumber: options.policyNumber,
  });

  if (isMockPolicyOverviewRequestEnabled()) {
    const product = isTestAnnuitiesEnabled()
      ? mockAnnuityResponse
      : mockPolicyResponse;
    const transformedResults = transformPolicyForCoverage(product);

    return {
      data: transformedResults,
      error: null,
    };
  }

  try {
    const response = await getPolicyByPlanCodeAndId(options);
    const transformedResults = transformPolicyForCoverage(response);
    return {
      data: transformedResults,
      error: null,
    };
  } catch (error) {
    logWarn('getCoverage error', { error });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 400,
        name: 'getCoverage Error',
      },
    };
  }
};

export const getBeneficiaries = async (
  options: PolicyRequestInputs
): Promise<ApiResponse<BeneficiaryData>> => {
  logTrace('getBeneficiaries', {
    planCode: options.planCode,
    policyNumber: options.policyNumber,
  });

  if (isMockPolicyOverviewRequestEnabled()) {
    const product = isTestAnnuitiesEnabled()
      ? mockAnnuityResponse
      : mockPolicyResponse;
    const transformedResults = transformPolicyForBeneficiaries(product);

    return {
      data: transformedResults,
      error: null,
    };
  }

  try {
    const response = await getPolicyByPlanCodeAndId(options);
    const transformedResults = transformPolicyForBeneficiaries(response);
    return {
      data: transformedResults,
      error: null,
    };
  } catch (error) {
    logWarn('getBeneficiaries Error', { error });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'getBeneficiaries Error',
      },
    };
  }
};

export const getBeneficiary = async (
  options: BeneficiaryRequestInputs
): Promise<ApiResponse<Beneficiary | undefined>> => {
  logTrace('getBeneficiary', {
    planCode: options.planCode,
    policyNumber: options.policyNumber,
    partyId: options.partyId,
  });

  if (isMockPolicyOverviewRequestEnabled()) {
    const transformedResults = transformPolicyForBeneficiary(
      mockPolicyResponse,
      options.partyId
    );

    return {
      data: transformedResults,
      error: null,
    };
  }

  try {
    const response = await getPolicyByPlanCodeAndId(options);
    const transformedResults = transformPolicyForBeneficiary(
      response,
      options.partyId
    );
    return {
      data: transformedResults,
      error: null,
    };
  } catch (error) {
    logWarn('getBeneficiary Error', { error });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'getBeneficiary Error',
      },
    };
  }
};

export const getPaymentDetails = async (
  options: PolicyRequestInputs
): Promise<ApiResponse<BankDetail[]>> => {
  logTrace('getPaymentDetails', {
    planCode: options.planCode,
    policyNumber: options.policyNumber,
  });

  if (isMockPolicyOverviewRequestEnabled()) {
    const product = isTestAnnuitiesEnabled()
      ? mockAnnuityResponse
      : mockPolicyResponse;
    const transformedResults = transformPolicyforPaymentDetails(product);

    return {
      data: transformedResults,
      error: null,
    };
  }

  try {
    const response = await getPolicyByPlanCodeAndId(options);
    const transformedResults = transformPolicyforPaymentDetails(response);
    return {
      data: transformedResults,
      error: null,
    };
  } catch (error) {
    logWarn('getPaymentDetails error', { error });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'getPaymentDetails Error',
      },
    };
  }
};

export const getPaymentHistory = async ({
  planCode,
  policyNumber,
}: PolicyRequestInputs): Promise<ApiResponse<PaymentHistoryTransaction>> => {
  logTrace('getPaymentHistory', {
    planCode,
    policyNumber,
  });

  const completedTransactionTypes = Object.values(
    CompletedPremiumTransactionType
  ).map(String);
  const pendingTransactionTypes = Object.values(
    PendingPremiumTransactionType
  ).map(String);

  if (isMockPaymentHistoryRequestEnabled()) {
    const product = isTestAnnuitiesEnabled()
      ? mockAnnuityResponse
      : mockPolicyResponse;
    return {
      data: {
        completedTransactions: mockCompletedTransactions.map(t =>
          transformPaymentHistory(product, t)
        ),
        pendingTransactions: mockPendingTransactions.map(t =>
          transformPaymentHistory(product, t)
        ),
      },
      error: null,
    };
  }

  try {
    const [policyPromise, completedPromise, pendingPromise] =
      await Promise.allSettled([
        getPolicyByPlanCodeAndId({ planCode, policyNumber }),
        getPolicyTransactions({
          transactionTypes: completedTransactionTypes,
          planCode,
          policyNumber,
          limit: 30,
          status: 'Completed',
        }),
        getPolicyTransactions({
          transactionTypes: pendingTransactionTypes,
          planCode,
          policyNumber,
          status: 'Pending',
        }),
      ]);

    if (policyPromise.status === 'rejected') {
      throw new Error('Policy Call failed');
    }

    if (
      completedPromise.status === 'rejected' &&
      pendingPromise.status === 'rejected'
    ) {
      logTrace('all requests for transactions were rejected', {
        completedReason: completedPromise.reason,
        pendingReason: pendingPromise.reason,
      });

      throw new Error('Something went wrong retrieving transactions');
    }

    // TODO: do we want to handle if just completed or just pending succeeds for whatever reason?
    const completedTransactions =
      completedPromise.status === 'fulfilled' ? completedPromise.value : [];
    const pendingTransactions =
      pendingPromise.status === 'fulfilled' ? pendingPromise.value : [];

    return {
      data: {
        completedTransactions: completedTransactions.map(t =>
          transformPaymentHistory(policyPromise.value, t)
        ),
        pendingTransactions: pendingTransactions.map(t =>
          transformPaymentHistory(policyPromise.value, t)
        ),
      },
      error: null,
    };
  } catch (error) {
    logWarn('getPaymentHistory Error', { error });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'getPaymentHistory Error',
      },
    };
  }
};

export const getAnnuityRecentTransactions = async ({
  planCode,
  policyNumber,
}: PolicyRequestInputs): Promise<ApiResponse<PaymentHistoryTransaction>> => {
  logTrace('getAnnuityRecentTransactions', {
    planCode,
    policyNumber,
  });

  const currentYear = new Date().getFullYear().toString();
  const completedTransactionTypes = Object.values(
    CompletedAnnuityTransactionType
  ).map(String);
  const pendingTransactionTypes = Object.values(
    PendingAnnuityTransactionType
  ).map(String);

  if (isMockPaymentHistoryRequestEnabled()) {
    const product = isTestAnnuitiesEnabled()
      ? mockAnnuityResponse
      : mockPolicyResponse;
    return {
      data: {
        completedTransactions: mockCompletedTransactions.map(t =>
          transformPaymentHistory(product, t)
        ),
        pendingTransactions: mockPendingTransactions.map(t =>
          transformPaymentHistory(product, t)
        ),
      },
      error: null,
    };
  }

  try {
    const [policyPromise, completedPromise, pendingPromise] =
      await Promise.allSettled([
        getPolicyByPlanCodeAndId({ planCode, policyNumber }),
        getPolicyTransactions({
          transactionTypes: completedTransactionTypes,
          planCode,
          policyNumber,
          limit: 30,
          status: 'Completed',
          year: currentYear,
        }),
        getPolicyTransactions({
          transactionTypes: pendingTransactionTypes,
          planCode,
          policyNumber,
          status: 'Pending',
          year: currentYear,
        }),
      ]);

    if (policyPromise.status === 'rejected') {
      throw new Error('Policy Call failed');
    }

    if (
      completedPromise.status === 'rejected' &&
      pendingPromise.status === 'rejected'
    ) {
      logTrace('all requests for transactions were rejected', {
        completedReason: completedPromise.reason,
        pendingReason: pendingPromise.reason,
      });

      throw new Error('Something went wrong retrieving transactions');
    }

    // TODO: do we want to handle if just completed or just pending succeeds for whatever reason?
    const completedTransactions =
      completedPromise.status === 'fulfilled' ? completedPromise.value : [];
    const pendingTransactions =
      pendingPromise.status === 'fulfilled' ? pendingPromise.value : [];

    return {
      data: {
        completedTransactions: completedTransactions.map(t =>
          transformPaymentHistory(policyPromise.value, t)
        ),
        pendingTransactions: pendingTransactions.map(t =>
          transformPaymentHistory(policyPromise.value, t)
        ),
      },
      error: null,
    };
  } catch (error) {
    logWarn('getAnnuityRecentTransactions Error', { error });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'getAnnuityRecentTransactions Error',
      },
    };
  }
};

export const getPolicyFundDetails = async (
  policyInputs: PolicyRequestInputs
): Promise<ApiResponse<PolicyFund[]>> => {
  logTrace('getPolicyFundDetails', {
    planCode: policyInputs.planCode,
    policyNumber: policyInputs.policyNumber,
  });

  if (isMockPolicyOverviewRequestEnabled()) {
    const product = isTestAnnuitiesEnabled()
      ? mockAnnuityResponse
      : mockPolicyResponse;
    const transformedResults = transformPolicyForFundDetails(product);

    return {
      data: transformedResults,
      error: null,
    };
  }

  try {
    const policy = await getPolicyByPlanCodeAndId(policyInputs);
    const transformedResults = transformPolicyForFundDetails(policy);

    if (!transformedResults) {
      logTrace('transformedResults object was returned null', {});

      return {
        data: null,
        error: {
          message: 'Something went wrong',
          status: 500,
          name: 'getPolicyFundDetails Error',
        },
      };
    }

    return {
      data: transformedResults,
      error: null,
    };
  } catch (error) {
    logWarn('getPolicyFundDetails Error', { error });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'getPolicyFundDetails Error',
      },
    };
  }
};

// TODO: add this returned data to getPolicyDetails and use that call in the component
export const getPolicySurrenderDetails = async (
  policyInputs: PolicyRequestInputs
): Promise<ApiResponse<PolicySurrender>> => {
  logTrace('getPolicySurrenderDetails', {
    planCode: policyInputs.planCode,
    policyNumber: policyInputs.policyNumber,
  });

  if (isMockPolicyOverviewRequestEnabled()) {
    const product = isTestAnnuitiesEnabled()
      ? mockAnnuityResponse
      : mockPolicyResponse;
    const transformedResults = transformPolicyForSurrender(product);

    return {
      data: transformedResults,
      error: null,
    };
  }

  try {
    const policy = await getPolicyByPlanCodeAndId(policyInputs);
    const transformedResults = transformPolicyForSurrender(policy);

    return {
      data: transformedResults,
      error: null,
    };
  } catch (error) {
    logWarn('getPolicySurrenderDetails Error', { error });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'getPolicySurrenderDetails Error',
      },
    };
  }
};

export const getPolicyWithdrawalDetails = async (
  policyInputs: PolicyRequestInputs
): Promise<ApiResponse<PolicyWithdrawals>> => {
  logTrace('getPolicyWithdrawalDetails', {
    planCode: policyInputs.planCode,
    policyNumber: policyInputs.policyNumber,
  });

  if (isMockPolicyOverviewRequestEnabled()) {
    const product = isTestAnnuitiesEnabled()
      ? mockAnnuityResponse
      : mockPolicyResponse;
    const transformedResults = transformPolicyForWithdrawals(product);

    return {
      data: transformedResults,
      error: null,
    };
  }

  try {
    const policy = await getPolicyByPlanCodeAndId(policyInputs);

    const transformedResults = transformPolicyForWithdrawals(policy);

    return {
      data: transformedResults,
      error: null,
    };
  } catch (error) {
    logWarn('getPolicyWithdrawalDetails Error', { error });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'getPolicyWithdrawalDetails Error',
      },
    };
  }
};

export const getPolicyLoanDetails = async (
  policyInputs: PolicyRequestInputs
): Promise<ApiResponse<PolicyLoans>> => {
  logTrace('getPolicyLoanDetails', {
    planCode: policyInputs.planCode,
    policyNumber: policyInputs.policyNumber,
  });

  if (isMockPolicyOverviewRequestEnabled()) {
    const product = isTestAnnuitiesEnabled()
      ? mockAnnuityResponse
      : mockPolicyResponse;
    const transformedResults = transformPolicyForLoans(product);

    return {
      data: transformedResults,
      error: null,
    };
  }

  try {
    const policy = await getPolicyByPlanCodeAndId(policyInputs);
    const transformedResults = transformPolicyForLoans(policy);

    return {
      data: transformedResults,
      error: null,
    };
  } catch (error) {
    logWarn('getPolicyLoanDetails error', { error });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'getPolicyLoanDetails Error',
      },
    };
  }
};

export const getRiders = async (
  options: PolicyRequestInputs
): Promise<ApiResponse<RidersAndBenefits>> => {
  logTrace('getRiders', {
    planCode: options.planCode,
    policyNumber: options.policyNumber,
  });

  if (isMockRidersRequestEnabled()) {
    const product = isTestAnnuitiesEnabled()
      ? mockAnnuityResponse
      : mockPolicyResponse;
    const transformedResults = transformRiders(product);

    return {
      data: transformedResults,
      error: null,
    };
  }

  try {
    const response = await getPolicyByPlanCodeAndId(options);
    const transformedResults = transformRiders(response);
    return {
      data: transformedResults,
      error: null,
    };
  } catch (error) {
    logWarn('getRiders error', { error });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 400,
        name: 'getRiders Error',
      },
    };
  }
};

export const getPolicyStatusDetails = async (
  policyInputs: PolicyRequestInputs
) => {
  logTrace('getPolicyStatusDetails', {
    planCode: policyInputs.planCode,
    policyNumber: policyInputs.policyNumber,
  });

  if (isMockPolicyOverviewRequestEnabled()) {
    const product = isTestAnnuitiesEnabled()
      ? mockAnnuityResponse
      : mockPolicyResponse;
    const transformedResults = transformPolicyStatusDetails(product);
    return {
      data: transformedResults,
      error: null,
    };
  }

  try {
    const response = await getPolicyByPlanCodeAndId(policyInputs);
    const transformedResults = transformPolicyStatusDetails(response);

    return {
      data: transformedResults,
      error: null,
    };
  } catch (error) {
    logWarn('getPolicyStatusDetails Error', { error });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 400,
        name: 'getPolicyStatusDetails Error',
      },
    };
  }
};

// Turn this into a larger policy return, add what we need into the transformer
export const getPolicyDetails = async (policyInputs: PolicyRequestInputs) => {
  logTrace('getPolicyProductDetails', {
    planCode: policyInputs.planCode,
    policyNumber: policyInputs.policyNumber,
  });

  if (isMockPolicyOverviewRequestEnabled()) {
    const transformedResults = transformPolicyDetails(mockPolicyResponse);

    return {
      data: transformedResults,
      error: null,
    };
  }

  try {
    const response = await getPolicyByPlanCodeAndId(policyInputs);
    const transformedResults = transformPolicyDetails(response);

    return {
      data: transformedResults,
      error: null,
    };
  } catch (error) {
    logWarn('getPolicyProductDetails Error', { error });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 400,
        name: 'getPolicyProductDetails Error',
      },
    };
  }
};
