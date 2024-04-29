import {
  PolicySearchRequest,
  PolicySearchResponse,
} from '@zinnia/api-types/types/search';
import {
  Policy,
  Transaction,
  TransactionErrorResponse,
  MetricsType,
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
  policyApiBaseUrl,
} from '@/services';
import { mockPolicyResponse } from '@/services/mocks/policy';
import { mockPolicySearchResponse } from '@/services/mocks/search';
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
} from '@/types/policy';
import { PolicyRider } from '@/types/riders';

import { getDocuments } from '../document';
import { mockDocumentsResponse } from '../mocks/documents';
import { MockMetricsResponse } from '../mocks/metrics';
import {
  mockCompletedTransactions,
  mockPendingTransactions,
} from '../mocks/transactions';

const getPolicyReferencesByCarrier = async () => {
  const searchUrl = `${policyApiBaseUrl}/search?offset=0&limit=10`;
  const searchFilter: PolicySearchRequest = {};
  if (isMockErrorEnabled(ApiEndpoints.POLICY_BY_CARRIERS)) {
    throw new Error('Error fetching policies by carrier.');
  }
  const request = await ServerApi.post(
    searchUrl,
    JSON.stringify(searchFilter),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  if (request.status !== 200) {
    throw new Error('Error fetching policy references');
  }

  const response = (await request.json()) as PolicySearchResponse;

  return response;
};

const getPolicyByPlanCodeAndId = async (options: PolicyRequestInputs) => {
  const { planCode, policyNumber } = options;
  const url = `${policyApiBaseUrl}/${planCode}/${policyNumber}`;
  if (isMockErrorEnabled(ApiEndpoints.POLICY)) {
    throw new Error('Error fetching policy.');
  }

  const request = await ServerApi.get(url);

  if (request.status !== 200) {
    throw new Error('Error fetching policy.');
  }
  const { data } = (await request.json()) as PolicyApiResponse<Policy>;
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

  const request = await ServerApi.get(url);
  const response = (await request.json()) as
    | TransactionErrorResponse
    | PolicyApiResponse<Transaction[]>;

  if (response.message !== 'SUCCESS') {
    throw new Error(response.message);
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

  const response = await ServerApi.post(url, JSON.stringify(metrics), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('something went wrong', { cause: response.status });
  }

  const responseData = await response.json();

  return responseData.data;
};

export const getMyPoliciesByCarrier = async (
  carrierId: string
): Promise<ApiResponse<PolicyReferenceData[]>> => {
  if (isMockSearchRequestEnabled()) {
    const filteredPolicies = mockPolicySearchResponse.results.filter(
      p => p.carrierId === carrierId
    );
    const transformedResults = transformPolicyReferenceData(filteredPolicies);
    return {
      data: transformedResults,
      error: null,
    };
  }

  try {
    const response = await getPolicyReferencesByCarrier();

    if (!response.results) {
      throw new Error('No data returned from the API.');
    }

    const filteredPolicies = response.results.filter(
      p => p.carrierId === carrierId
    );
    const transformedResults = transformPolicyReferenceData(filteredPolicies);

    return {
      data: transformedResults,
      error: null,
    };
  } catch (error) {
    console.log(error);
    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 400,
        name: 'getPolicyOverviewData Error',
      },
    };
  }
};

export const getPolicyAccountValue = async (
  options: PolicyRequestInputs
): Promise<ApiResponse<PolicyAccountValue>> => {
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
    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 400,
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
  const data = await Promise.allSettled([
    getPolicyAccountValue(options),
    get30DayAccountValueChange(options),
  ]);

  if (data[0].status === 'rejected' || data[0].value.error) {
    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'getPolicyAccountValue Error',
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
    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 400,
        name: 'getPolicyOverviewData Error',
      },
    };
  }
};

export const getUpcomingPremium = async (
  options: PolicyRequestInputs
): Promise<ApiResponse<UpcomingPremium>> => {
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
    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'getCoverage Error',
      },
    };
  }
};

export const getBeneficiary = async (
  options: BeneficiaryRequestInputs
): Promise<ApiResponse<Beneficiary | undefined>> => {
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
    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'getCoverage Error',
      },
    };
  }
};

export const getPaymentDetails = async (
  options: PolicyRequestInputs
): Promise<ApiResponse<BankDetail>> => {
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
    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'fetchPolicyTransactions Error',
      },
    };
  }
};
export const getPaymentHistory = async ({
  planCode,
  policyNumber,
}: PolicyRequestInputs): Promise<ApiResponse<PaymentHistoryTransaction>> => {
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
      throw new Error('Something went wrong');
    }

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
    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'fetchPolicyTransactions Error',
      },
    };
  }
};
export const getCorrespondenceDocuments = async (
  policyInputs: PolicyRequestInputs,
  inputs: Partial<DocumentApiRequestInputs>
): Promise<ApiResponse<PolicyDocument>> => {
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
      throw new Error('No data returned from the API.');
    }

    return {
      data: response,
      error: null,
    };
  } catch (error) {
    console.log(error);

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
    console.log(error);
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
    console.log(error);

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
    console.log(error);

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
    console.log(error);
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
    console.log(error);
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

export const getRiders = async (
  options: PolicyRequestInputs
): Promise<ApiResponse<PolicyRider[]>> => {
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
    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 400,
        name: 'getPolicyFeatures Error',
      },
    };
  }
};
