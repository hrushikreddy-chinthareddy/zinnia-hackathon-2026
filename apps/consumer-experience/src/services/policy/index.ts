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

import { BankDetail } from '@/components/person-data/types';
import {
  ApiResponse,
  ServerApi,
  documentApiBaseUrl,
  isMockAllRequestEnabled,
  isMockDocumentRequestEnabled,
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
} from '@/services/policy/transformers';
import {
  DocumentApiRequestInputs,
  DocumentResponseError,
  PolicyDocument,
} from '@/types/document';
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
} from '@/types/policy';
import { PolicyRider } from '@/types/riders';

import { mockDocumentsResponse } from '../mocks/documents';
import { MockMetricsResponse } from '../mocks/metrics';
import {
  mockCompletedTransactions,
  mockPendingTransactions,
} from '../mocks/transactions';

const getPolicyReferencesByCarrier = async () => {
  const searchUrl = `${policyApiBaseUrl}/search?offset=0&limit=10`;
  const searchFilter: PolicySearchRequest = {};
  const request = await ServerApi.post(searchUrl, JSON.stringify(searchFilter));

  if (request.status !== 200) {
    throw new Error('Error fetching policy references');
  }

  const response = (await request.json()) as PolicySearchResponse;

  return response;
};

const getPolicyByPlanCodeAndId = async (options: PolicyRequestInputs) => {
  const { planCode, policyNumber } = options;
  const url = `${policyApiBaseUrl}/${planCode}/${policyNumber}`;
  const request = await ServerApi.get(url);
  if (request.status !== 200) {
    throw new Error('Error fetching policy.');
  }
  const { data } = (await request.json()) as PolicyApiResponse<Policy>;
  return data;
};

const getPolicyTransactions = async ({
  eventNames,
  policyNumber,
  limit = 10,
  offset = 0,
  order = 'ASC',
  planCode,
  status,
  year,
}: TransactionRequestInputs) => {
  let query = `?offset=${offset}&limit=${limit}&order=${order}&status=${status}`;
  // TODO: eventNames will change to transactionTypes on April 9th 2024
  if (eventNames.length) {
    query =
      query +
      `&${eventNames.map(eventName => `eventNames=${eventName}`).join('&')}`;
  }

  if (year) {
    query = `${query}&startDate=${year}-01-01&endDate=${year}-12-31`;
  }

  const url = `${policyApiBaseUrl}/${planCode}/${policyNumber}/transactions${query}`;
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
  const completedEventNames = Object.values(
    CompletedPremiumTransactionType
  ).map(String);
  const pendingEventNames = Object.values(PendingPremiumTransactionType).map(
    String
  );

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
          eventNames: completedEventNames,
          planCode,
          policyNumber,
          limit: 30,
          status: 'Completed',
          year: currentYear,
        }),
        getPolicyTransactions({
          eventNames: pendingEventNames,
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

const getDocuments = async (inputs: Partial<DocumentApiRequestInputs>) => {
  const { contractNumber, clientCode, source } = inputs;
  const documentUrl = `${documentApiBaseUrl}?contractNumber=${contractNumber}&clientCode=${clientCode}&source=${source}`;

  const response = await ServerApi.get(documentUrl);

  if (response.status !== 200) {
    throw new Error(`API returned an error. Status code: ${response.status}`);
  }

  const data = (await response.json()) as
    | DocumentResponseError
    | PolicyDocument;

  console.log(data);
  return data;
};

export const getPolicyDocuments = async (
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
    inputs.source = 'Policy';
    const response = await getDocuments(inputs);

    if (!response) {
      throw new Error('No data returned from the API.');
    }

    return {
      data: {
        statusCode: 200,
        count: 0,
        items: [],
      },
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

export const getPolicyWithdrawalDetails = async (
  policyInputs: PolicyRequestInputs
): Promise<ApiResponse<any>> => {
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
        name: 'getPolicyAccountValueSummary Error',
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
