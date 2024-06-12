import { PolicyStatus } from '@zinnia/api-types/types/sor';
import { Badge, BadgeVariant } from '@zinnia/bloom/internal/components';
import clsx from 'clsx';
import { HTMLAttributes } from 'react';

import { getPolicyForHeaderDetails } from '@/services/policy';
import { policyStatusDisplayText } from '@/utils/data';
import { toSentenceCase } from '@/utils/strings';

import styles from './HeaderPolicyDetails.module.css';
import { PolicyNumber } from './PolicyNumber';

export interface Props extends HTMLAttributes<HTMLDivElement> {
  planCode: string;
  policyNumber: string;
}

export const HeaderPolicyDetails = async ({
  className,
  planCode,
  policyNumber,
}: Props) => {
  const { data, error } = await getPolicyForHeaderDetails({
    planCode,
    policyNumber,
  });

  if (error || !data) {
    return null;
  }

  const badgeVariant = () => {
    switch (data.policyStatus) {
      case PolicyStatus.PENDINGISSUED:
      case PolicyStatus.ACTIVE:
        return BadgeVariant.SUCCESS;
      case PolicyStatus.PENDINGLAPSE:
        return BadgeVariant.WARNING;
      case PolicyStatus.LAPSE:
      case PolicyStatus.SURRENDERED:
        return BadgeVariant.ERROR;
      default:
        return BadgeVariant.DEFAULT;
    }
  };

  return (
    <div
      className={clsx(
        { [className as string]: className },
        'typography-labels-label-md-alt',
        styles.container
      )}
    >
      <div className={`mr-md ${styles.mobileBadge}`}>
        <Badge
          label={toSentenceCase(policyStatusDisplayText[data.policyStatus])}
          variant={badgeVariant()}
        />
      </div>
      <div>
        <p>{data.marketingName}</p>
        <p>
          <span>Policy #: </span>
          <PolicyNumber planCode={planCode} policyNumber={policyNumber} />
        </p>
      </div>
      <div className={`ml-md ${styles.desktopBadge}`}>
        <Badge
          label={toSentenceCase(policyStatusDisplayText[data.policyStatus])}
          variant={badgeVariant()}
        />
      </div>
    </div>
  );
};
