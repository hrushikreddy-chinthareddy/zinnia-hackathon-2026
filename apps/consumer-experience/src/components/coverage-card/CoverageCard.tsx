'use client';

import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';

import { AcknowledgePolicyCard } from '@/components/acknowledge-policy-card/AcknowledgePolicyCard';
import { CoverageOverviewCard } from '@/components/coverage-overview-card/CoverageOverviewCard';
import { checkIfPolicyRequiresAcknowledgement } from '@/queries/policy-queries';
import { QueryKeys } from '@/queries/query-keys';
import { CarrierPolicyDetails } from '@/types/policy';
import { ACKNOWLEDGEMENT_COOKIE_KEY } from '@/utils/serverClientUtils';

import { ClickableCardContainer } from '../clickable-card-container/ClickableCardContainer';
import { SkeletonLoader } from '../skeleton-loader/SkeletonLoader';

// We don't set the cookie here because we rely on that to happen
// either in middleware or once the user has actively acknowledged the
// policy
export const CoverageCard = ({ policy }: { policy: CarrierPolicyDetails }) => {
  const ackowledgedCookie = Cookies.get(ACKNOWLEDGEMENT_COOKIE_KEY);
  const parsedCookie = JSON.parse(ackowledgedCookie || '[]');
  const policyIsInAcknowledgedCookie = parsedCookie?.includes(
    policy.policyNumber
  );

  const { data: requiresAckowledgement, isLoading } = useQuery({
    enabled: !policyIsInAcknowledgedCookie,
    queryKey: [QueryKeys.POLICY_ACKNOWLEDGEMENT, policy.policyNumber],
    queryFn: () =>
      checkIfPolicyRequiresAcknowledgement(
        policy.planCode,
        policy.policyNumber
      ),
  });

  if (isLoading) {
    return (
      <ClickableCardContainer>
        <div className="stacked-items mb-lg">
          <SkeletonLoader width="150px" height="14px" className="mb-sm" />
          <SkeletonLoader width="125px" height="14px" className="mb-sm" />
          <SkeletonLoader width="175px" height="14px" className="mb-sm" />
        </div>
        <SkeletonLoader width="100%" height="14px" />
      </ClickableCardContainer>
    );
  }

  if (requiresAckowledgement && requiresAckowledgement.isEligible) {
    return <AcknowledgePolicyCard policy={policy} />;
  }

  return <CoverageOverviewCard policy={policy} />;
};
