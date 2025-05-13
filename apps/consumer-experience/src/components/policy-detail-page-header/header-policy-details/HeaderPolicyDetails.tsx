'use client';
import { useQuery } from '@tanstack/react-query';
import { LineOfBusiness, PolicyStatus } from '@zinnia/api-types/types/sor';
import { Badge, BadgeVariant } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { HTMLAttributes } from 'react';

import { AgentSidesheet } from '@/components/agent-sidesheet/AgentSidesheet';
import { SkeletonLoader } from '@/components/skeleton-loader/SkeletonLoader';
import { getAgentInformation } from '@/queries/agent-queries';
import { getPolicyDetails } from '@/queries/policy-queries';
import { isAnnuity, policyStatusDisplayText } from '@/utils/data';
import { toSentenceCase } from '@/utils/strings';

import styles from './HeaderPolicyDetails.module.css';

export interface Props extends HTMLAttributes<HTMLDivElement> {
  planCode: string;
  policyNumber: string;
  lineOfBusiness?: LineOfBusiness;
}

export const HeaderPolicyDetails = ({
  className,
  lineOfBusiness = LineOfBusiness.LIFE,
  planCode,
  policyNumber,
}: Props) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ['policyData', planCode, policyNumber],
    queryFn: () => getPolicyDetails(planCode, policyNumber),
  });

  const { data: agentData, isLoading: agentDataLoading } = useQuery({
    queryKey: ['agentData', data?.primaryAgentExternalId, policyNumber],
    queryFn: () =>
      getAgentInformation({
        clientCode: data?.carrierId,
        agentId: data?.primaryAgentExternalId,
      }),
    enabled: !!data?.primaryAgentExternalId,
  });

  const badgeVariant = () => {
    switch (data?.policyStatus) {
      case PolicyStatus.PENDINGISSUED:
      case PolicyStatus.ACTIVE:
        return BadgeVariant.SUCCESS;
      case PolicyStatus.PENDINGLAPSE:
        return BadgeVariant.WARNING;
      case PolicyStatus.LAPSE:
      case PolicyStatus.SURRENDERED:
      case PolicyStatus.CANCELEDFREELOOK:
        return BadgeVariant.ERROR;
      default:
        return BadgeVariant.DEFAULT;
    }
  };

  if (isLoading || agentDataLoading) {
    return (
      <div className="stacked-items my-sm">
        <SkeletonLoader width="150px" height="14px" className="mb-sm" />
        <SkeletonLoader width="150px" height="14px" className="mb-sm" />
        <SkeletonLoader width="150px" height="14px" className="mb-sm" />
      </div>
    );
  }

  if (!data || error) {
    return null;
  }

  return (
    <div
      className={clsx(
        { [className as string]: className },
        // TODO: update this to use the font style variables
        // on larger screen sizes this should be lg-alt
        'typography-labels-label-md-alt',
        styles.container
      )}
    >
      <div className={`mr-md ${styles.mobileBadge}`}>
        <Badge
          label={toSentenceCase(
            policyStatusDisplayText[data?.policyStatus as PolicyStatus]
          )}
          variant={badgeVariant()}
        />
      </div>
      <div>
        <p>{data?.product?.marketingName}</p>
        <p>
          <span>{isAnnuity(lineOfBusiness) ? 'Contract' : 'Policy'} #: </span>
          <span>{policyNumber}</span>
        </p>
        {/* There is the possibility that an agent id is on the policy, but no agent data
          is returned from mcs so null check is on the name rather than on the full object */}
        {agentData && agentData.fullName && (
          <>
            <span>Agent:</span>
            <AgentSidesheet agentData={agentData} />
          </>
        )}
      </div>
      <div className={`ml-md ${styles.desktopBadge}`}>
        <Badge
          label={toSentenceCase(
            policyStatusDisplayText[data?.policyStatus as PolicyStatus]
          )}
          variant={badgeVariant()}
        />
      </div>
    </div>
  );
};
