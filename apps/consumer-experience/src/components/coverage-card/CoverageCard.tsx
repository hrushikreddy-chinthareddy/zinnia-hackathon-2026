'use client';

import { skipToken, useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

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
  const [clientReady, setClientReady] = useState(false);

  const ackowledgedCookie = Cookies.get(ACKNOWLEDGEMENT_COOKIE_KEY);
  const parsedCookie = JSON.parse(ackowledgedCookie || '[]');

  const policyIsInAcknowledgedCookie = parsedCookie?.includes(
    policy.policyNumber
  );

  useEffect(() => {
    setClientReady(true);
  }, []);

  // TODO: there is a full refresh happening for some reason, is it something with this?
  const { data: requiresAckowledgement, isLoading } = useQuery({
    queryKey: [QueryKeys.POLICY_ACKNOWLEDGEMENT, policy.policyNumber],
    queryFn: !policyIsInAcknowledgedCookie
      ? () =>
          checkIfPolicyRequiresAcknowledgement(
            policy.planCode,
            policy.policyNumber
          )
      : skipToken,
  });

  console.log('policyIsInAcknowledgedCookie', policyIsInAcknowledgedCookie);
  console.log('requiresAckowledgement', requiresAckowledgement);

  if (!clientReady) {
    return null;
  }

  if (isLoading) {
    return (
      <ClickableCardContainer>
        <div
          className="stacked-items mb-lg"
          style={{ gap: 'var(--measure-dimension-gap-sm)' }}
        >
          <SkeletonLoader width="150px" height="14px" />
          <SkeletonLoader width="125px" height="14px" />
          <SkeletonLoader width="175px" height="14px" />
        </div>
        <SkeletonLoader width="100%" height="14px" />
      </ClickableCardContainer>
    );
  }

  if (
    // Include this check because if the user checks the box to acknowledge the policy, the
    // requiresAcknowledgement query was already run and the data cached, so this check
    // will still return true without the additional cookie check
    !policyIsInAcknowledgedCookie &&
    requiresAckowledgement &&
    requiresAckowledgement.isEligible
  ) {
    return <AcknowledgePolicyCard policy={policy} />;
  }

  return <CoverageOverviewCard policy={policy} />;
};
