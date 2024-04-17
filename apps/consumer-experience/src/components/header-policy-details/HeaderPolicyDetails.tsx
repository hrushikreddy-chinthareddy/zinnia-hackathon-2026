import { PolicyStatus } from '@zinnia/api-types/types/sor';
import clsx from 'clsx';
import Link from 'next/link';

import { getPolicyForHeaderDetails } from '@/services';
import { checkIfNull, fullName } from '@/utils/data';
import { toSentenceCase } from '@/utils/strings';

import styles from './HeaderPolicyDetails.module.css';
import MockMessage from '../MockMessage';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  /**
   * Includes additional data like insured and policy status
   */
  expanded?: boolean;
  planCode: string;
  policyNumber: string;
  /**
   * This will make the policy number a link to return to policy overview page
   */
  useAsLink?: boolean;
}

const policyDisplayText: { [key in PolicyStatus]: string } = {
  [PolicyStatus.ACTIVE]: 'active',
  [PolicyStatus.PENDINGISSUED]: 'active',
  [PolicyStatus.PENDINGLAPSE]: 'pending lapse',
  [PolicyStatus.LAPSE]: 'lapsed',
  [PolicyStatus.SURRENDERED]: 'surrendered',
  // These are statuses we don't display, users should not be able to log in with these statuses
  [PolicyStatus.NOTISSUED]: '',
  [PolicyStatus.CANCELEDNOPREMIUM]: '',
  [PolicyStatus.CANCELEDFREELOOK]: '',
  [PolicyStatus.TERMINATED]: '',
  [PolicyStatus.MATURED]: '',
  [PolicyStatus.LIVINGCLAIMPENDING]: '',
  [PolicyStatus.DEATHCLAIMPENDING]: '',
  [PolicyStatus.DEATHCLAIMPAID]: '',
};

export const HeaderPolicyDetails = async ({
  className,
  expanded,
  style,
  planCode,
  policyNumber,
  useAsLink,
}: Props) => {
  const { data, error } = await getPolicyForHeaderDetails({
    planCode,
    policyNumber,
  });

  if (error) {
    return <MockMessage />;
  }

  const { firstName, lastName, marketingName, planName, policyStatus } = data!;

  const statusStyle = () => {
    switch (policyStatus) {
      case PolicyStatus.PENDINGISSUED:
      case PolicyStatus.ACTIVE:
        return styles.success;
      case PolicyStatus.PENDINGLAPSE:
        return styles.warning;
      case PolicyStatus.LAPSE:
      case PolicyStatus.SURRENDERED:
        return styles.error;
      default:
        return '';
    }
  };

  const insuredName = fullName({ firstName, lastName });

  const policyNumberEl = () => {
    const content = `Policy No. ${checkIfNull(policyNumber)}`;

    return useAsLink ? (
      <Link
        className="typography-labels-label-md-alt"
        href={`/policies/${planCode}/${policyNumber}`}
        aria-label="Return to policy overview"
      >
        {content}
      </Link>
    ) : (
      <p className="typography-labels-label-md-alt">{content}</p>
    );
  };

  return (
    <div
      className={clsx(styles.container, { [`${className}`]: className })}
      style={style}
    >
      <p className="typography-labels-label-lg-alt">
        {`${marketingName || ''} ${marketingName && planName ? '-' : ''} ${planName || ''}`}
      </p>
      <div className={styles.policyDetails}>
        {policyNumberEl()}

        {expanded && (
          <>
            <p className="typography-labels-label-md-alt">
              {`Insured: ${insuredName}`}
            </p>
            <p className="typography-labels-label-md-alt">
              Policy status:{' '}
              <span className={statusStyle()}>
                {checkIfNull(toSentenceCase(policyDisplayText[policyStatus]))}
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};
