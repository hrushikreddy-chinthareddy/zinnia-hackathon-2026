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
  enterprisePolicySearchBaseUrl,
  isMockErrorEnabled,
  isMockPaymentHistoryRequestEnabled,
  isMockPolicyMetricsRequestEnabled,
  isMockPolicyOverviewRequestEnabled,
  isMockRidersRequestEnabled,
  isMockSearchRequestEnabled,
  isTestAnnuitiesEnabled,
  isTestPoliciesEnabled,
  policyApiBaseUrl,
} from '@/services/api-config';
import { mockPolicyResponse } from '@/services/mocks/policy';
import {
  transformPolicyReferenceData,
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
  transformPolicyStatusDetails,
  transformPolicyDetails,
  sortPoliciesByIssuedDate,
  transformPolicyForProfile,
  transformPolicyForSurrender,
  getPartyRolesFromPolicyPartyId,
  transformPolicyParties,
} from '@/services/policy/transformers';
import { ServerApi } from '@/services/server-http';
import { ApiResponse } from '@/services/types';
import { CarrierId } from '@/types/carriers';
import {
  PolicyApiResponse,
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
  PaymentHistoryTransaction,
  PolicyMetricsRequestInputs,
  PolicyFund,
  PolicyWithdrawals,
  PolicyLoans,
  CarrierPolicyDetails,
  PolicyProfile,
  PolicyStatusDetail,
  PolicySurrender,
  CompletedPremiumTransactionType,
  PendingPremiumTransactionType,
  Metric,
  PendingAnnuityTransactionType,
  CompletedAnnuityTransactionType,
} from '@/types/policy';
import { RidersAndBenefits } from '@/types/riders';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { getSession } from '@/utils/auth';
import { logError, logInfo } from '@/utils/logging/log-fns';
import { CommonLogContext } from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import { getFeatureFlags } from '../feature-flags';
import { getLoggedInUserPolicyAndPartyDataErrors } from './types';
import { mockAnnuityResponse } from '../mocks/annuity';
import { MockMetricsResponse } from '../mocks/metrics';
import {
  mockCompletedTransactions,
  mockPendingTransactions,
} from '../mocks/transactions';
import { getPartyReferenceData } from '../party-reference';
import {
  getPartyRolesByPolicyNumber,
  getPolicyPartyIdByPolicyNumber,
} from '../party-reference/transformers';
import { getPaymentMethods } from '../payment-methods';

const FILE_NAME = '/src/services/policy/index.ts';

const getPolicyReferencesByCarrierEnterprise = withLogging(
  async (loggingCtx?: CommonLogContext) => {
    const searchUrl = `${enterprisePolicySearchBaseUrl}/search?searchEntity=policy&offset=0&limit=100`;
    const searchFilter: PolicySearchRequest = {};
    const session = await getSession();
    const partyId = session?.user?.partyId;

    if (isTestPoliciesEnabled()) {
      // @ts-expect-error specs aren't updated in developer portal yet
      searchFilter['carrier'] = CarrierId.SBUL;
    }

    if (isMockErrorEnabled(ApiEndpoints.POLICY_BY_CARRIERS)) {
      throw new Error('Error fetching policies by carrier.');
    }

    const rawResponse = await ServerApi.post(
      searchUrl,
      // TODO: we shouldn't have to pass partyIds here, but people were seeing the wrong
      // policies before adding this.
      JSON.stringify({ ...searchFilter, partyIds: [partyId] }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
      loggingCtx
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
  },
  { file: FILE_NAME, functionName: 'getPolicyReferencesByCarrierEnterprise' }
);

/**
 * Returns error object that occur while fetching policy data from an API.
 *
 * @param {Response} rawResponse - The raw response object received from the API call.
 * @param {unknown} parsedResponse - The parsed response object obtained from the API call.
 * @return {Object} An object containing apiMessage, statusText, statusCode, url, and sessionInfo.
 */
const getPolicyReferencesByCarrier = withLogging(
  async (loggingCtx?: CommonLogContext) => {
    const featureFlags = await getFeatureFlags();
    const searchUrl = featureFlags[FEATURE_FLAGS.ENTERPRISE_POLICY_SEARCH]
      ? `${policyApiBaseUrl}/search?searchEntity=policy&offset=0&limit=100`
      : `${policyApiBaseUrl}/search?offset=0&limit=100`;
    const searchFilter: PolicySearchRequest = {};

    if (isTestPoliciesEnabled()) {
      // @ts-expect-error specs aren't updated in developer portal yet
      searchFilter['carrierIds'] = CarrierId.SBUL;
    }

    if (isMockErrorEnabled(ApiEndpoints.POLICY_BY_CARRIERS)) {
      throw new Error('Error fetching policies by carrier.');
    }

    const rawResponse = await ServerApi.post(
      searchUrl,
      JSON.stringify(searchFilter),
      {
        headers: { 'Content-Type': 'application/json' },
      },
      loggingCtx
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
  },
  { file: FILE_NAME, functionName: 'getPolicyReferencesByCarrier' }
);

export const getPolicyByPlanCodeAndId = withLogging(
  async (options: PolicyRequestInputs, loggingCtx: CommonLogContext) => {
    const { planCode, policyNumber } = options;

    if (!planCode) {
      throw new Error('Missing plan code to get policy', {
        cause: { options },
      });
    }

    if (!policyNumber) {
      throw new Error('Missing policyNumber to get policy', {
        cause: { options },
      });
    }

    const url = `${policyApiBaseUrl}/${planCode}/${policyNumber}?viewDetails=true`;

    if (isMockErrorEnabled(ApiEndpoints.POLICY)) {
      throw new Error('Error fetching policy.', {
        cause: { policyNumber, planCode },
      });
    }

    const rawResponse = await ServerApi.get(url, undefined, loggingCtx);

    const response = await parseAPIResponse(rawResponse);

    if (!rawResponse?.ok) {
      const failureDetails = await logApiNotOkDetails({
        rawResponse,
        parsedResponse: response,
      });
      throw new Error('Error fetching policy.', {
        cause: { policyNumber, planCode, failureDetails },
      });
    }

    const { data } = response as PolicyApiResponse<Policy>;

    if (!data) {
      throw new Error('No data returned trying to retrieve policy.', {
        cause: { policyNumber, planCode },
      });
    }

    return data;
  },
  { file: FILE_NAME, functionName: 'getPolicyByPlanCodeAndId' }
);

/**
 * Retrieves the bank details associated with a policy based on its plan code and policy number.
 *
 * @param {PolicyRequestInputs} options - The options object containing the plan code and policy number.
 * @return {Promise<BankDetail[] | undefined>} - A promise that resolves to an array of bank details, or undefined if the policy owner has no bank details.
 *
 * DO NOT USE THIS ON FRONTEND. This returns the full accountNumber. There is another method that retreives sanitized bank accounts.
 */
export const getUnsanitizedBanksByPolicyPlanCodeAndId = withLogging(
  async (
    options: PolicyRequestInputs,
    loggingCtx: CommonLogContext
  ): Promise<BankAccount[] | undefined> => {
    const { planCode, policyNumber } = options;
    const { data: policy, error } = await getPolicyByPlanCodeAndId(
      {
        planCode,
        policyNumber,
      },
      loggingCtx
    );

    if (!policy || !!error) {
      throw new Error('No data returned trying to retrieve policy.', {
        cause: { policyNumber, planCode, error },
      });
    }

    return policyOwner(policy)?.bankDetails;
  },
  { file: FILE_NAME, functionName: 'getUnsanitizedBanksByPolicyPlanCodeAndId' }
);

const getPolicyTransactions = withLogging(
  async (
    {
      transactionTypes,
      policyNumber,
      limit = 10,
      offset = 0,
      order = 'ASC',
      planCode,
      status,
      year,
    }: TransactionRequestInputs,
    loggingCtx: CommonLogContext
  ): Promise<Transaction[]> => {
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

    const rawResponse = await ServerApi.get(url, undefined, loggingCtx);
    const response = (await parseAPIResponse(rawResponse)) as
      | TransactionErrorResponse
      | PolicyApiResponse<Transaction[]>;

    if (!rawResponse?.ok) {
      throw new Error('Error fetching policy transactions', {
        cause: {
          details: await logApiNotOkDetails({
            rawResponse,
            parsedResponse: response,
          }),
          status: rawResponse?.status,
        },
      });
    }

    return (response as PolicyApiResponse<Transaction[]>).data || [];
  },
  { file: FILE_NAME, functionName: 'getPolicyTransactions' }
);

const getPolicyMetrics = withLogging(
  async (
    options: PolicyRequestInputs,
    metrics: PolicyMetricsRequestInputs,
    loggingCtx: CommonLogContext
  ): Promise<Metric[]> => {
    const { planCode, policyNumber } = options;
    const url = `${policyApiBaseUrl}/${planCode}/${policyNumber}/metrics`;

    if (isMockErrorEnabled(ApiEndpoints.METRICS)) {
      throw new Error('Error fetching metrics.', {
        cause: { planCode, policyNumber, metrics },
      });
    }

    const rawResponse = await ServerApi.post(
      url,
      JSON.stringify(metrics),
      {
        headers: { 'Content-Type': 'application/json' },
      },
      loggingCtx
    );

    const response = await parseAPIResponse(rawResponse);

    if (!rawResponse?.ok) {
      throw new Error('Error fetching policy metrics', {
        cause: {
          details: await logApiNotOkDetails({
            rawResponse,
            parsedResponse: response,
          }),
          status: rawResponse?.status,
        },
      });
    }

    return (response as PolicyApiResponse<Metric[]>).data;
  },
  { file: FILE_NAME, functionName: 'getPolicyMetrics' }
);

export const getMyPoliciesByCarrier = withLogging(
  async (
    // TODO: how could this be a string?
    carrierId: string[] | string,
    loggingCtx: CommonLogContext
  ): Promise<CarrierPolicyDetails[]> => {
    const featureFlags = await getFeatureFlags();

    if (isMockSearchRequestEnabled()) {
      const product = isTestAnnuitiesEnabled()
        ? mockAnnuityResponse
        : mockPolicyResponse;
      return transformPolicyReferenceData([product]);
    }

    const { data: response, error } = featureFlags[
      FEATURE_FLAGS.ENTERPRISE_POLICY_SEARCH
    ]
      ? await getPolicyReferencesByCarrierEnterprise(loggingCtx)
      : await getPolicyReferencesByCarrier(loggingCtx);

    if (!response && !error) {
      throw new Error(
        'No response returned when fetching policy references by carrier.'
      );
    }

    if (error) {
      throw new Error('Failed to fetch policy references by carrier.', {
        cause: { error },
      });
    }

    if (response && !response.results) {
      throw new Error(
        'No results returned when fetching policy references by carrier.'
      );
    }

    // TODO: why did we do it this way rather than passing carrierId array to the search?
    const filteredPolicies: Promise<ApiResponse<Policy>>[] = response.results
      .filter((p: Policy) => carrierId.includes(p.carrierId || ''))
      .map(
        ({
          planCode,
          policyNumber,
        }: PolicyReferenceData): Promise<ApiResponse<Policy>> => {
          if (!planCode || planCode === 'undefined') {
            throw new Error('Missing plan code in policy reference data');
          }

          if (!policyNumber || policyNumber === 'undefined') {
            throw new Error('Missing policy number in policy reference data');
          }
          return getPolicyByPlanCodeAndId(
            {
              planCode,
              policyNumber,
            },
            loggingCtx
          );
        }
      );

    if (!filteredPolicies || filteredPolicies.length === 0) {
      throw new Error('No returned policies matched the carrier filter', {
        cause: {
          carrierList: carrierId,
        },
      });
    }

    const allPolicyDataSettledResult =
      await Promise.allSettled<ApiResponse<Policy>>(filteredPolicies);

    const hasFulfilledPolicy = allPolicyDataSettledResult.some(
      a => a.status === 'fulfilled'
    );

    if (!hasFulfilledPolicy) {
      throw new Error('All requests to get policy data failed');
    }

    const allPolicyData = allPolicyDataSettledResult.map(p => {
      if (p.status === 'fulfilled') {
        if (!p.value.data || p.value.error) {
          throw new Error('Failed to fetch policy data', {
            cause: p.value.error,
          });
        }
        return p.value.data;
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
    return sortedResults;
  },
  { file: FILE_NAME, functionName: 'getMyPoliciesByCarrier' }
);

export const getPolicyAccountValue = withLogging(
  async (
    options: PolicyRequestInputs,
    loggingCtx: CommonLogContext
  ): Promise<PolicyAccountValue> => {
    if (isMockPolicyOverviewRequestEnabled()) {
      const product = isTestAnnuitiesEnabled()
        ? mockAnnuityResponse
        : mockPolicyResponse;
      return transformPolicyForAccountValue(product);
    }

    const { data: response, error } = await getPolicyByPlanCodeAndId(
      options,
      loggingCtx
    );

    if (!response || !!error) {
      throw new Error('Failed to fetch policy data for account value.', {
        cause: { ...options, error },
      });
    }
    return transformPolicyForAccountValue(response);
  },
  { file: FILE_NAME, functionName: 'getPolicyAccountValue' }
);

export const get30DayAccountValueChange = withLogging(
  async (
    options: PolicyRequestInputs,
    loggingCtx: CommonLogContext
  ): Promise<{ valueChange: number } | null> => {
    if (isMockPolicyMetricsRequestEnabled()) {
      return transformPolicyMetricsForAccountValueChange(MockMetricsResponse);
    }

    const { data, error } = await getPolicyMetrics(
      options,
      {
        startDate: dayjs().subtract(30, 'day').toISOString(),
        endDate: dayjs().toISOString(),
        metrics: [MetricsType.ACCOUNTVALUE],
      },
      loggingCtx
    );

    if (error || !data) {
      throw new Error('Error fetching policy metrics', {
        cause: { ...options, error },
      });
    }

    return transformPolicyMetricsForAccountValueChange(data);
  },
  { file: FILE_NAME, functionName: 'get30DayAccountValueChange' }
);

export const getPolicyAccountValueWith30DayChange = withLogging(
  async (
    options: PolicyRequestInputs,
    loggingCtx: CommonLogContext
  ): Promise<PolicyAccountValue> => {
    const promises = await Promise.allSettled([
      getPolicyAccountValue(options, loggingCtx),
      get30DayAccountValueChange(options, loggingCtx),
    ]);

    const anySuccess = promises.filter(item => item.status === 'fulfilled');

    if (!anySuccess) {
      throw new Error(
        'all requests to get policy account value and 30 day change were rejected',
        {
          cause: promises,
        }
      );
    }

    // Return error specifically if policy account value fails because the 30day change value
    // is meaningful in conjunction with that value, but not alone
    if (promises?.[0].status === 'rejected' || promises?.[0].value.error) {
      throw new Error('getPolicyAccountValue request was rejected', {
        cause: promises[0].status === 'rejected' && promises[0].reason,
      });
    }

    const allData = promises.reduce((successData, item) => {
      if (item.status === 'fulfilled' && item.value.data) {
        successData = { ...successData, ...item.value.data };
      }

      return successData;
    }, {});

    return allData;
  },
  { file: FILE_NAME, functionName: 'getPolicyAccountValueWith30DayChange' }
);

// TODO: convert this to just getPolicyDetails
export const getPolicyForHeaderDetails = withLogging(
  async (
    options: PolicyRequestInputs,
    loggingCtx: CommonLogContext
  ): Promise<PolicyDetails> => {
    if (isMockPolicyOverviewRequestEnabled()) {
      const product = isTestAnnuitiesEnabled()
        ? mockAnnuityResponse
        : mockPolicyResponse;
      return transformPolicyForHeaderDetails(product);
    }

    const { data: response, error } = await getPolicyByPlanCodeAndId(
      options,
      loggingCtx
    );

    if (!response || !!error) {
      throw new Error('Policy data is null', {
        cause: { ...options, error },
      });
    }

    return transformPolicyForHeaderDetails(response);
  },
  { file: FILE_NAME, functionName: 'getPolicyForHeaderDetails' }
);

export const getPolicyProfileData = withLogging(
  async (
    options: PolicyRequestInputs,
    loggingCtx: CommonLogContext
  ): Promise<PolicyProfile> => {
    if (isMockPolicyOverviewRequestEnabled()) {
      const product = isTestAnnuitiesEnabled()
        ? mockAnnuityResponse
        : mockPolicyResponse;
      return transformPolicyForProfile(product, ''); //TODO: How to mock this? Pass in a partyId that matches the mock data?
    }

    const { data, error } = await getLoggedInUserPolicyAndPartyData(
      options,
      loggingCtx
    );

    if (error || !data.policy) {
      throw new Error('Failed to fetch policy data for profile.', {
        cause: { ...options, error },
      });
    }

    return transformPolicyForProfile(data.policy, data.policyPartyId);
  },
  { file: FILE_NAME, functionName: 'getPolicyProfileData' }
);

export const getUpcomingPremium = withLogging(
  async (
    options: PolicyRequestInputs,
    loggingCtx: CommonLogContext
  ): Promise<UpcomingPremium> => {
    if (isMockPolicyOverviewRequestEnabled()) {
      const product = isTestAnnuitiesEnabled()
        ? mockAnnuityResponse
        : mockPolicyResponse;
      return transformPolicyForUpcomingPremium(product);
    }

    const { data: response, error } = await getPolicyByPlanCodeAndId(
      options,
      loggingCtx
    );

    if (!response || !!error) {
      throw new Error('Policy data is null while fetching upcoming premium', {
        cause: { ...options, error },
      });
    }

    return transformPolicyForUpcomingPremium(response);
  },
  { file: FILE_NAME, functionName: 'getUpcomingPremium' }
);

export const getCoverage = withLogging(
  async (
    options: PolicyRequestInputs,
    loggingCtx: CommonLogContext
  ): Promise<PolicyCoverage> => {
    if (isMockPolicyOverviewRequestEnabled()) {
      const product = isTestAnnuitiesEnabled()
        ? mockAnnuityResponse
        : mockPolicyResponse;
      return transformPolicyForCoverage(product);
    }

    const { data: response, error } = await getPolicyByPlanCodeAndId(
      options,
      loggingCtx
    );

    if (error || !response) {
      throw new Error('Something went wrong getting coverage', {
        cause: { ...options, error },
      });
    }

    return transformPolicyForCoverage(response);
  },
  { file: FILE_NAME, functionName: 'getCoverage' }
);

export const getBeneficiaries = withLogging(
  async (
    options: PolicyRequestInputs,
    loggingCtx: CommonLogContext
  ): Promise<BeneficiaryData> => {
    if (isMockPolicyOverviewRequestEnabled()) {
      const product = isTestAnnuitiesEnabled()
        ? mockAnnuityResponse
        : mockPolicyResponse;
      return transformPolicyForBeneficiaries(product);
    }

    const { data: response, error } = await getPolicyByPlanCodeAndId(
      options,
      loggingCtx
    );

    if (!response || !!error) {
      throw new Error('Failed to fetch policy data to process beneficiaries.', {
        cause: { ...options, error },
      });
    }

    return transformPolicyForBeneficiaries(response);
  },
  { file: FILE_NAME, functionName: 'getBeneficiaries' }
);

export const getBeneficiary = withLogging(
  async (
    options: BeneficiaryRequestInputs,
    loggingCtx: CommonLogContext
  ): Promise<Beneficiary | undefined> => {
    if (isMockPolicyOverviewRequestEnabled()) {
      return transformPolicyForBeneficiary(mockPolicyResponse, options.partyId);
    }

    const { data: policyData, error: policyError } =
      await getPolicyByPlanCodeAndId(options, loggingCtx);

    if (policyError || !policyData) {
      throw new Error('Failed to fetch policy data for beneficiary.', {
        cause: { ...options, error: policyError },
      });
    }

    return transformPolicyForBeneficiary(policyData, options.partyId);
  },
  { file: FILE_NAME, functionName: 'getBeneficiary' }
);

export const getPaymentDetails = withLogging(
  async (
    options: PolicyRequestInputs,
    loggingCtx: CommonLogContext
  ): Promise<BankDetail[]> => {
    if (isMockPolicyOverviewRequestEnabled()) {
      const product = isTestAnnuitiesEnabled()
        ? mockAnnuityResponse
        : mockPolicyResponse;
      return transformPolicyforPaymentDetails(product);
    }

    const { data: policyData, error: policyError } =
      await getPolicyByPlanCodeAndId(options, loggingCtx);

    if (policyError || !policyData) {
      throw new Error('Failed to fetch policy data for payment details.', {
        cause: { ...options, error: policyError },
      });
    }

    return transformPolicyforPaymentDetails(policyData);
  },
  { file: FILE_NAME, functionName: 'getPaymentDetails' }
);

// @TODO: This is has duplicate logic with getAnnuityRecentTransactions and should be refactored
export const getPaymentHistory = withLogging(
  async (
    { planCode, policyNumber }: PolicyRequestInputs,
    loggingCtx: CommonLogContext
  ): Promise<PaymentHistoryTransaction> => {
    const completedTransactionTypes = Object.values(
      CompletedPremiumTransactionType
    ).map(String);
    const pendingTransactionTypes = Object.values(
      PendingPremiumTransactionType
    ).map(String);

    if (isMockPaymentHistoryRequestEnabled()) {
      return {
        completedTransactions: mockCompletedTransactions.map(t =>
          transformPaymentHistory([], t)
        ),
        pendingTransactions: mockPendingTransactions.map(t =>
          transformPaymentHistory([], t)
        ),
      };
    }

    const [
      completedTransactionsRes,
      pendingTransactionsRes,
      paymentMethodsRes,
    ] = await Promise.allSettled([
      getPolicyTransactions(
        {
          transactionTypes: completedTransactionTypes,
          planCode,
          policyNumber,
          limit: 30,
          status: 'Completed',
        },
        loggingCtx
      ),
      getPolicyTransactions(
        {
          transactionTypes: pendingTransactionTypes,
          planCode,
          policyNumber,
          status: 'Pending',
        },
        loggingCtx
      ),
      getPaymentMethods({ planCode, policyNumber }, loggingCtx),
    ]);

    // Check for rejected promises
    if (paymentMethodsRes.status === 'rejected') {
      logInfo(
        'Failed to fetch payment methods for premium payment history',
        loggingCtx
      );
    }

    if (
      completedTransactionsRes.status === 'rejected' &&
      pendingTransactionsRes.status === 'rejected'
    ) {
      throw new Error('All requests for transactions were rejected', {
        cause: {
          completedReason: completedTransactionsRes.reason,
          pendingReason: pendingTransactionsRes.reason,
          ...loggingCtx,
        },
      });
    }

    // Check if errors are returned
    if (
      paymentMethodsRes.status === 'fulfilled' &&
      (paymentMethodsRes.value.error ||
        !paymentMethodsRes.value.data ||
        paymentMethodsRes.value.data.length === 0)
    ) {
      logInfo(
        'Payment methods call fulfilled but returned error or no data',
        loggingCtx
      );
    }

    if (
      (completedTransactionsRes.status === 'fulfilled' &&
        (!!completedTransactionsRes.value.error ||
          !completedTransactionsRes.value.data)) ||
      (pendingTransactionsRes.status === 'fulfilled' &&
        (!!pendingTransactionsRes.value.error ||
          !pendingTransactionsRes.value.data))
    ) {
      throw new Error('Transactions returned an error', {
        cause: {
          planCode,
          policyNumber,
          ...loggingCtx,
        },
      });
    }

    const completedTransactions =
      completedTransactionsRes.status === 'fulfilled'
        ? completedTransactionsRes.value.data || []
        : [];
    const pendingTransactions =
      pendingTransactionsRes.status === 'fulfilled'
        ? pendingTransactionsRes.value.data || []
        : [];
    const paymentMethods =
      paymentMethodsRes.status === 'fulfilled' && paymentMethodsRes.value?.data
        ? paymentMethodsRes.value.data
        : [];

    return {
      completedTransactions: completedTransactions.map(t =>
        transformPaymentHistory(paymentMethods, t)
      ),
      pendingTransactions: pendingTransactions.map(t =>
        transformPaymentHistory(paymentMethods, t)
      ),
    };
  },
  { file: FILE_NAME, functionName: 'getPaymentHistory' }
);

// @TODO: This is has duplicate logic with getPaymentHistory and should be refactored
export const getAnnuityRecentTransactions = withLogging(
  async (
    { planCode, policyNumber }: PolicyRequestInputs,
    loggingCtx: CommonLogContext
  ): Promise<PaymentHistoryTransaction> => {
    const currentYear = new Date().getFullYear().toString();
    const completedTransactionTypes = Object.values(
      CompletedAnnuityTransactionType
    ).map(String);
    const pendingTransactionTypes = Object.values(
      PendingAnnuityTransactionType
    ).map(String);

    if (isMockPaymentHistoryRequestEnabled()) {
      return {
        completedTransactions: mockCompletedTransactions.map(t =>
          transformPaymentHistory([], t)
        ),
        pendingTransactions: mockPendingTransactions.map(t =>
          transformPaymentHistory([], t)
        ),
      };
    }

    const [
      completedTransactionsRes,
      pendingTransactionsRes,
      paymentMethodsRes,
    ] = await Promise.allSettled([
      getPolicyTransactions(
        {
          transactionTypes: completedTransactionTypes,
          planCode,
          policyNumber,
          limit: 30,
          status: 'Completed',
          year: currentYear,
        },
        loggingCtx
      ),
      getPolicyTransactions(
        {
          transactionTypes: pendingTransactionTypes,
          planCode,
          policyNumber,
          status: 'Pending',
          year: currentYear,
        },
        loggingCtx
      ),
      getPaymentMethods({ planCode, policyNumber }, loggingCtx),
    ]);

    if (paymentMethodsRes.status === 'rejected') {
      logInfo(
        'Failed to fetch payment methods for premium payment history',
        loggingCtx
      );
    }

    if (completedTransactionsRes.status === 'rejected') {
      throw new Error('Completed transactions call failed', {
        cause: {
          planCode,
          policyNumber,
          error: completedTransactionsRes.reason,
          ...loggingCtx,
        },
      });
    }
    if (pendingTransactionsRes.status === 'rejected') {
      throw new Error('Pending transactions call failed', {
        cause: {
          planCode,
          policyNumber,
          error: pendingTransactionsRes.reason,
          ...loggingCtx,
        },
      });
    }

    // 1- Check fetched payment methods
    if (
      paymentMethodsRes.status === 'fulfilled' &&
      (paymentMethodsRes.value.error ||
        !paymentMethodsRes.value.data ||
        paymentMethodsRes.value.data.length === 0)
    ) {
      logInfo(
        'Payment methods call fulfilled but returned error or no data',
        loggingCtx
      );
    }

    const paymentMethods =
      paymentMethodsRes.status === 'fulfilled' && paymentMethodsRes.value?.data
        ? paymentMethodsRes.value.data
        : [];

    // 2- Check fetched completed transactions
    const {
      data: completedTransactionsData,
      error: completedTransactionsError,
    } = completedTransactionsRes.value;

    if (completedTransactionsError || !completedTransactionsData) {
      throw new Error('Completed transactions call failed', {
        cause: {
          planCode,
          policyNumber,
          error: completedTransactionsError,
          ...loggingCtx,
        },
      });
    }

    // 3- Check fetched pending transactions
    const { data: pendingTransactionsData, error: pendingTransactionsError } =
      pendingTransactionsRes.value;

    if (pendingTransactionsError || !pendingTransactionsData) {
      throw new Error('Pending transactions call failed', {
        cause: {
          planCode,
          policyNumber,
          error: pendingTransactionsError,
          ...loggingCtx,
        },
      });
    }

    // TODO: do we want to handle if just completed or just pending succeeds for whatever reason?
    const completedTransactions = completedTransactionsData ?? [];
    const pendingTransactions = pendingTransactionsData ?? [];

    return {
      completedTransactions: completedTransactions.map(t =>
        transformPaymentHistory(paymentMethods, t)
      ),
      pendingTransactions: pendingTransactions.map(t =>
        transformPaymentHistory(paymentMethods, t)
      ),
    };
  },
  { file: FILE_NAME, functionName: 'getAnnuityRecentTransactions' }
);

export const getPolicyFundDetails = withLogging(
  async (
    policyInputs: PolicyRequestInputs,
    loggingCtx: CommonLogContext
  ): Promise<PolicyFund[]> => {
    if (isMockPolicyOverviewRequestEnabled()) {
      const product = isTestAnnuitiesEnabled()
        ? mockAnnuityResponse
        : mockPolicyResponse;

      const transformedResults = transformPolicyForFundDetails(product);
      if (!transformedResults) {
        throw new Error(
          'Failed to process mock policy data for fund details.',
          {
            cause: { ...policyInputs },
          }
        );
      }
      return transformedResults;
    }

    const { data: policyData, error: policyError } =
      await getPolicyByPlanCodeAndId(policyInputs, loggingCtx);
    if (policyError || !policyData) {
      throw new Error('Failed to fetch policy data for fund details.', {
        cause: { ...policyInputs, error: policyError },
      });
    }

    const transformedResults = transformPolicyForFundDetails(policyData);
    if (!transformedResults) {
      throw new Error('Failed to process policy data for fund details.', {
        cause: { ...policyInputs },
      });
    }

    return transformedResults;
  },
  { file: FILE_NAME, functionName: 'getPolicyFundDetails' }
);

// TODO: add this returned data to getPolicyDetails and use that call in the component
export const getPolicySurrenderDetails = withLogging(
  async (
    policyInputs: PolicyRequestInputs,
    loggingCtx: CommonLogContext
  ): Promise<PolicySurrender> => {
    if (isMockPolicyOverviewRequestEnabled()) {
      const product = isTestAnnuitiesEnabled()
        ? mockAnnuityResponse
        : mockPolicyResponse;
      return transformPolicyForSurrender(product);
    }

    const { data: policyData, error: policyError } =
      await getPolicyByPlanCodeAndId(policyInputs, loggingCtx);

    if (policyError || !policyData) {
      throw new Error('Failed to fetch policy data for surrender details.', {
        cause: { ...policyInputs, error: policyError },
      });
    }

    return transformPolicyForSurrender(policyData);
  },
  { file: FILE_NAME, functionName: 'getPolicySurrenderDetails' }
);

export const getPolicyWithdrawalDetails = withLogging(
  async (
    policyInputs: PolicyRequestInputs,
    loggingCtx: CommonLogContext
  ): Promise<PolicyWithdrawals | null> => {
    if (isMockPolicyOverviewRequestEnabled()) {
      const product = isTestAnnuitiesEnabled()
        ? mockAnnuityResponse
        : mockPolicyResponse;
      return transformPolicyForWithdrawals(product);
    }

    const { data: policyData, error: policyError } =
      await getPolicyByPlanCodeAndId(policyInputs, loggingCtx);

    if (policyError || !policyData) {
      throw new Error('Failed to fetch policy data for withdrawal details.', {
        cause: { ...policyInputs, error: policyError },
      });
    }

    return transformPolicyForWithdrawals(policyData);
  },
  { file: FILE_NAME, functionName: 'getPolicyWithdrawalDetails' }
);

export const getPolicyLoanDetails = withLogging(
  async (
    policyInputs: PolicyRequestInputs,
    loggingCtx: CommonLogContext
  ): Promise<PolicyLoans> => {
    if (isMockPolicyOverviewRequestEnabled()) {
      const product = isTestAnnuitiesEnabled()
        ? mockAnnuityResponse
        : mockPolicyResponse;
      return transformPolicyForLoans(product);
    }

    const { data: policyData, error: policyError } =
      await getPolicyByPlanCodeAndId(policyInputs, loggingCtx);

    if (policyError || !policyData) {
      throw new Error('Failed to fetch policy data for loan details.', {
        cause: { ...policyInputs, error: policyError },
      });
    }

    return transformPolicyForLoans(policyData);
  },
  { file: FILE_NAME, functionName: 'getPolicyLoanDetails' }
);

export const getRiders = withLogging(
  async (
    options: PolicyRequestInputs,
    loggingCtx: CommonLogContext
  ): Promise<RidersAndBenefits> => {
    if (isMockRidersRequestEnabled()) {
      const product = isTestAnnuitiesEnabled()
        ? mockAnnuityResponse
        : mockPolicyResponse;
      return transformRiders(product);
    }

    const { data: policyData, error: policyError } =
      await getPolicyByPlanCodeAndId(options, loggingCtx);

    if (policyError || !policyData) {
      throw new Error('Failed to fetch policy data for riders.', {
        cause: { ...options, error: policyError },
      });
    }

    return transformRiders(policyData);
  },
  { file: FILE_NAME, functionName: 'getRiders' }
);

export const getPolicyStatusDetails = withLogging(
  async (
    policyInputs: PolicyRequestInputs,
    loggingCtx: CommonLogContext
  ): Promise<Partial<PolicyStatusDetail>> => {
    if (isMockPolicyOverviewRequestEnabled()) {
      const product = isTestAnnuitiesEnabled()
        ? mockAnnuityResponse
        : mockPolicyResponse;
      return transformPolicyStatusDetails(product);
    }

    const { data: policyData, error: policyError } =
      await getPolicyByPlanCodeAndId(policyInputs, loggingCtx);

    if (policyError || !policyData) {
      throw new Error('Failed to fetch policy data for status details.', {
        cause: { ...policyInputs, error: policyError },
      });
    }

    return transformPolicyStatusDetails(policyData);
  },
  { file: FILE_NAME, functionName: 'getPolicyStatusDetails' }
);

// Turn this into a larger policy return, add what we need into the transformer
export const getPolicyDetails = withLogging(
  async (policyInputs: PolicyRequestInputs, loggingCtx: CommonLogContext) => {
    if (isMockPolicyOverviewRequestEnabled()) {
      return transformPolicyDetails(mockPolicyResponse);
    }
    const policyResponse = await getPolicyByPlanCodeAndId(
      policyInputs,
      loggingCtx
    );

    if (policyResponse.error || !policyResponse.data) {
      throw new Error('Failed to fetch policy data for details.', {
        cause: { ...policyInputs, error: policyResponse.error },
      });
    }

    return transformPolicyDetails(policyResponse.data);
  },
  { file: FILE_NAME, functionName: 'getPolicyDetails' }
);

export const getPolicyParties = withLogging(
  async (policyInputs: PolicyRequestInputs, loggingCtx: CommonLogContext) => {
    const policyResponse = await getPolicyByPlanCodeAndId(
      {
        planCode: policyInputs.planCode,
        policyNumber: policyInputs.policyNumber,
      },
      loggingCtx
    );

    if (policyResponse.error || !policyResponse.data) {
      // TODO: i don't think this should throw an error or a warn, but i do want it
      // to exit out of this and return the correct data, error object
      throw new Error('Failed to fetch policy data for parties.', {
        cause: { ...policyInputs, error: policyResponse.error },
      });
    }

    return transformPolicyParties(policyResponse.data);
  },
  { file: FILE_NAME, functionName: 'getPolicyParties' }
);

/**
 * Returns a list of the roles and the policy partyId for the logged in user associated with a particular policy.
 */
export const getLoggedInUserPolicyAndPartyData = withLogging(
  async (options: PolicyRequestInputs, loggingCtx: CommonLogContext) => {
    const session = await getSession();
    const partyId = session?.user?.partyId || '';
    const { planCode, policyNumber } = options;
    const [{ data: partyRefData }, { data: policyData }] = await Promise.all([
      getPartyReferenceData(partyId, loggingCtx),
      getPolicyByPlanCodeAndId(
        {
          planCode,
          policyNumber,
        },
        loggingCtx
      ),
    ]);

    if (!partyRefData) {
      throw new Error(
        getLoggedInUserPolicyAndPartyDataErrors.NO_PARTY_REFERENCE_DATA_FOUND
      );
    }

    // try to get partyRoles from the party reference API
    // TODO: right now the partyRoles setting below is overriding this, this is
    // the preferred way of getting party roles but does not work for all carriers right now
    let partyRoles = getPartyRolesByPolicyNumber(partyRefData, policyNumber);
    // We need to find the policy they are currently
    // viewing and see if it exists on the party reference data of the
    // current logged in user
    const policyPartyId =
      getPolicyPartyIdByPolicyNumber(partyRefData, policyNumber) || '';

    if (!policyData) {
      throw new Error(getLoggedInUserPolicyAndPartyDataErrors.NO_POLICY_FOUND);
    }
    if (!policyPartyId) {
      throw new Error(
        getLoggedInUserPolicyAndPartyDataErrors.NO_PARTY_ID_FOUND
      );
    }

    // TODO: this overrides the partyRoles from above right now, we need to reevaluate
    // if this should. There were instances where alias does not return on the partyRef data
    partyRoles = getPartyRolesFromPolicyPartyId(policyPartyId, policyData);

    return {
      partyRoles,
      policyPartyId,
      policy: policyData,
    };
  },
  {
    file: FILE_NAME,
    functionName: 'getLoggedInUserPartyRole',
  }
);
