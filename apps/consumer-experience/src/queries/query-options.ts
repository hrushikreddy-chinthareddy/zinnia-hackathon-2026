import { queryOptions } from '@tanstack/react-query';
import { LineOfBusiness } from '@xd/api-types/dist/generated-types/sor';

import { CaseSearchCriteriaWithLimit } from '@/services/case';

import {
  acknowledgeCase,
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

type MarkAsReadOptions = {
  planCode: string;
  policyNumber: string;
};

export const markAsReadMutationOptions = ({
  planCode,
  policyNumber,
}: MarkAsReadOptions) => ({
  mutationFn: ({
    id,
    stepsToAcknowledge,
  }: {
    id: string;
    stepsToAcknowledge: string[];
  }) =>
    acknowledgeCase({
      acknowledgedIds: stepsToAcknowledge,
      caseId: id,
      planCode,
      policyNumber,
    }),
  mutationKey: ['acknowledgeCase', planCode, policyNumber],
});

type MarkAllAsReadOptions = {
  planCode: string;
  policyNumber: string;
  notifications: { id: string; stepsToAcknowledge: string[] }[];
};
export const markAllAsReadMutationOptions = ({
  planCode,
  policyNumber,
  notifications,
}: MarkAllAsReadOptions) => ({
  mutationFn: () =>
    Promise.allSettled(
      notifications.map(notification =>
        acknowledgeCase({
          acknowledgedIds: notification.stepsToAcknowledge,
          caseId: notification.id,
          planCode,
          policyNumber,
        })
      )
    ).then(results => results.filter(result => result.status === 'fulfilled')),
  mutationKey: ['acknowledgeAllCases', planCode, policyNumber],
});
