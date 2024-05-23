import {
  PolicySearchRequest,
  PolicySearchResponse,
} from '@zinnia/api-types/types/search';
import {
  Policy,
  Transaction,
  TransactionErrorResponse,
  MetricsType,
  PolicyStatus,
} from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';

import { ApiEndpoints } from '@/components/dev-menu/types';
import { BankDetail } from '@/components/person-data/types';
import {
  ApiResponse,
  ServerApi,
  isMockDocumentRequestEnabled,
  isMockErrorEnabled,
  isMockPaymentHistoryRequestEnabled,
  isMockPolicyMetricsRequestEnabled,
  isMockPolicyOverviewRequestEnabled,
  isMockRidersRequestEnabled,
  isMockSearchRequestEnabled,
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
  transformPolicyForAccountValueSummary,
  transformRiders,
  transformPolicyForWithdrawals,
  transformPolicyForLoans,
  transformPolicyForSurrender,
  transformPolicyStatusDetails,
} from '@/services/policy/transformers';
import { DocumentApiRequestInputs, PolicyDocument } from '@/types/document';
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
  AccountValueSummary,
  PolicyFund,
  PolicyWithdrawals,
  PolicyLoans,
  PolicySurrender,
  CarrierPolicyDetails,
} from '@/types/policy';
import { RidersAndBenefits } from '@/types/riders';
import { parseAPIResponse, userSessionForLogging } from '@/utils/api';
import { logError, logTrace, logWarn } from '@/utils/logging/server-logging';

import { getDocuments } from '../document';
import { mockDocumentsResponse } from '../mocks/documents';
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
const logApiNotOkDetails = async ({
  rawResponse,
  parsedResponse,
}: {
  rawResponse: Response;
  parsedResponse: unknown;
}) => {
  const sessionInfo = await userSessionForLogging();
  const { message } = parsedResponse as { message?: string };
  const { statusText, status, url } = rawResponse;

  return {
    apiMessage: message,
    statusText,
    statusCode: status,
    url,
    ...sessionInfo,
  };
};

const getPolicyReferencesByCarrier = async () => {
  const searchUrl = `${policyApiBaseUrl}/search?offset=0&limit=10`;
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
      'Error fetching policy search restults',
      await logApiNotOkDetails({ rawResponse, parsedResponse: response })
    );

    throw new Error('Error fetching policy references');
  }

  return response;
};

const getPolicyByPlanCodeAndId = async (options: PolicyRequestInputs) => {
  const { planCode, policyNumber } = options;
  const url = `${policyApiBaseUrl}/${planCode}/${policyNumber}`;
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
  carrierId: string
): Promise<ApiResponse<CarrierPolicyDetails[]>> => {
  logTrace('called getMyPoliciesByCarrier', { carrierId });

  if (isMockSearchRequestEnabled()) {
    const transformedResults = transformPolicyReferenceData([
      mockPolicyResponse,
    ]);

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
      .filter((p: Policy) => p.carrierId === carrierId)
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

    return {
      data: transformedResults,
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
    const transformedResults =
      transformPolicyForAccountValue(mockPolicyResponse);

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

export const getPolicyForHeaderDetails = async (
  options: PolicyRequestInputs
): Promise<ApiResponse<PolicyDetails>> => {
  logTrace('getPolicyForHeaderDetails', {
    planCode: options.planCode,
    policyNumber: options.policyNumber,
  });

  if (isMockPolicyOverviewRequestEnabled()) {
    const transformedResults =
      transformPolicyForHeaderDetails(mockPolicyResponse);

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
    const transformedResults = transformPolicyForProfile(mockPolicyResponse);

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
    const transformedResults =
      transformPolicyForUpcomingPremium(mockPolicyResponse);

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
    const transformedResults = transformPolicyForCoverage(mockPolicyResponse);

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
    const transformedResults =
      transformPolicyForBeneficiaries(mockPolicyResponse);

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
    const transformedResults =
      transformPolicyforPaymentDetails(mockPolicyResponse);

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

  const currentYear = new Date().getFullYear().toString();
  const completedTransactionTypes = Object.values(
    CompletedPremiumTransactionType
  ).map(String);
  const pendingTransactionTypes = Object.values(
    PendingPremiumTransactionType
  ).map(String);

  if (isMockPaymentHistoryRequestEnabled()) {
    return {
      data: {
        completedTransactions: mockCompletedTransactions.map(t =>
          transformPaymentHistory(mockPolicyResponse, t)
        ),
        pendingTransactions: mockPendingTransactions.map(t =>
          transformPaymentHistory(mockPolicyResponse, t)
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

export const getCorrespondenceDocuments = async (
  policyInputs: PolicyRequestInputs,
  inputs: Partial<DocumentApiRequestInputs>
): Promise<ApiResponse<PolicyDocument>> => {
  logTrace('getCorrespondenceDocuments', {
    planCode: policyInputs.planCode,
    policyNumber: policyInputs.policyNumber,
  });

  if (isMockDocumentRequestEnabled()) {
    return {
      data: mockDocumentsResponse,
      error: null,
    };
  }

  try {
    const policy = await getPolicyByPlanCodeAndId(policyInputs);
    inputs.clientCode = policy.carrierId;
    inputs.source = 'Correspondence';
    const response = await getDocuments(inputs);

    if (!response?.items) {
      throw new Error('No documents returned from the API');
    }

    return {
      data: response,
      error: null,
    };
  } catch (error) {
    logWarn('getCorrespondenceDocuments error', { error });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 400,
        name: 'getCorrespondenceDocuments Error',
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
    const transformedResults =
      transformPolicyForFundDetails(mockPolicyResponse);

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

export const getPolicySurrenderDetails = async (
  policyInputs: PolicyRequestInputs
): Promise<ApiResponse<PolicySurrender>> => {
  logTrace('getPolicySurrenderDetails', {
    planCode: policyInputs.planCode,
    policyNumber: policyInputs.policyNumber,
  });

  if (isMockPolicyOverviewRequestEnabled()) {
    const transformedResults = transformPolicyForSurrender(mockPolicyResponse);

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
    const transformedResults =
      transformPolicyForWithdrawals(mockPolicyResponse);

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

export const getPolicyAccountValueSummary = async (
  policyInputs: PolicyRequestInputs
): Promise<ApiResponse<AccountValueSummary>> => {
  logTrace('getPolicyAccountValueSummary', {
    planCode: policyInputs.planCode,
    policyNumber: policyInputs.policyNumber,
  });

  if (isMockPolicyOverviewRequestEnabled()) {
    const transformedResults =
      transformPolicyForAccountValueSummary(mockPolicyResponse);

    return {
      data: transformedResults,
      error: null,
    };
  }

  try {
    const policy = await getPolicyByPlanCodeAndId(policyInputs);
    const transformedResults = transformPolicyForAccountValueSummary(policy);

    return {
      data: transformedResults,
      error: null,
    };
  } catch (error) {
    logWarn('getPolicyAccountValueSummary Error', { error });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'getPolicyAccountValueSummary Error',
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
    const transformedResults = transformPolicyForLoans(mockPolicyResponse);

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
    const transformedResults = transformRiders(mockPolicyResponse);

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
    const transformedResults = transformPolicyStatusDetails(mockPolicyResponse);

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
