import {
  PolicySearchRequest,
  PolicySearchResponse,
} from '@zinnia/api-types/types/search';

import {
  ApiResponse,
  ServerApi,
  isMockPolicyOverviewRequestEnabled,
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
} from '@/types/policy';

const getPolicyReferencesByCarrier = async () => {
  const searchUrl = `${policyApiBaseUrl}/search?offset=0&limit=10`;
  const searchFilter: PolicySearchRequest = {
    firstName: 'Wanda',
  };
  const response = await ServerApi.post(
    searchUrl,
    JSON.stringify(searchFilter)
  );
  const data = (await response.json()) as PolicySearchResponse;

  return data;
};

const getPolicyByPlanCodeAndId = async (options: PolicyRequestInputs) => {
  const { planCode, policyNumber } = options;
  const url = `${policyApiBaseUrl}/${planCode}/${policyNumber}`;
  const response = await ServerApi.get(url);
  const { data } = (await response.json()) as PolicyApiResponse;
  return data;
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

export const getCoverae = async (
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
        name: 'getCoverae Error',
      },
    };
  }
};
