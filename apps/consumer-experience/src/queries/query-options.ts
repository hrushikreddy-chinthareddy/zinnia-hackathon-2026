import { queryOptions } from '@tanstack/react-query';
import { LineOfBusiness } from '@xd/api-types/dist/generated-types/sor';

import { CaseSearchCriteriaWithLimit } from '@/services/case';

import {
  getAcknowledgedCases,
  searchCasesByPolicyNumber,
} from './case-queries';
import { getFeatureFlags } from './feature-flag-queries';
import { QueryKeys } from './query-keys';

export const featureFlagOptions = () =>
  queryOptions({
    queryKey: [QueryKeys.FEATURE_FLAGS],
    queryFn: () => getFeatureFlags(),
    staleTime: 15 * 60 * 1000,
  });

type SearchCasesByPolicyNumberOptions = {
  planCode: string;
  policyNumber: string;
  lineOfBusiness: LineOfBusiness;
};
export const searchCasesByPolicyNumberOptions = ({
  planCode,
  policyNumber,
  lineOfBusiness,
}: SearchCasesByPolicyNumberOptions) =>
  queryOptions({
    queryKey: [
      QueryKeys.CASES_FOR_POLICY,
      planCode,
      policyNumber,
      lineOfBusiness,
    ],
    queryFn: () => searchCasesByPolicyNumber({ policyNumber }),
  });

type AcknowledgedCasesOptions = {
  planCode: string;
  policyNumber: string;
  limit?: number;
};

export const acknowledgedCasesOptions = ({
  planCode,
  policyNumber,
}: AcknowledgedCasesOptions) =>
  queryOptions({
    queryKey: [QueryKeys.NOTIFICATIONS, QueryKeys.NOTIFICATION_ACKNOWLEDGMENT],
    queryFn: () => getAcknowledgedCases({ planCode, policyNumber }),
  });

export const caseQueryOptions = ({
  policyNumber,
  limit = 10,
  caseStatus = [],
}: CaseSearchCriteriaWithLimit) =>
  queryOptions({
    queryKey: [QueryKeys.CASES_FOR_POLICY, policyNumber, limit, caseStatus],
    queryFn: () =>
      searchCasesByPolicyNumber({ policyNumber, limit, caseStatus }),
  });
