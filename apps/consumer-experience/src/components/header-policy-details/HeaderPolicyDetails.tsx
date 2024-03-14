import { PolicyStatus } from '@zinnia/api-types/types/sor';
import clsx from 'clsx';
import { headers } from 'next/headers';

import { getPolicyForHeaderDetails } from '@/services';
import { checkIfNull, fullName } from '@/utils/data';
import { toSentenceCase } from '@/utils/strings';

import styles from './HeaderPolicyDetails.module.css';
import MockMessage from '../MockMessage';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

// TODO: add surrendered and locked statuses
const policyDisplayText: { [key in PolicyStatus]: string } = {
  [PolicyStatus.ACTIVE]: 'active',
  [PolicyStatus.PENDINGISSUED]: 'active',
  [PolicyStatus.PENDINGLAPSE]: 'pending lapse',
  [PolicyStatus.LAPSE]: 'lapsed',
  // TODO: what is the display for this one?
  [PolicyStatus.NOTISSUED]: '',
  [PolicyStatus.CANCELEDNOPREMIUM]: '',
  [PolicyStatus.CANCELEDFREELOOK]: '',
  [PolicyStatus.TERMINATED]: '',
  [PolicyStatus.MATURED]: '',
  [PolicyStatus.SURRENDERED]: '',
  [PolicyStatus.LIVINGCLAIMPENDING]: '',
  [PolicyStatus.DEATHCLAIMPENDING]: '',
  [PolicyStatus.DEATHCLAIMPAID]: '',
};

export const HeaderPolicyDetails = async ({ className, style }: Props) => {
  const headerStore = headers();

  const { data, error } = await getPolicyForHeaderDetails({
    planCode: headerStore.get('planCode') || '',
    policyNumber: headerStore.get('policyNumber') || '',
  });

  if (error) {
    return <MockMessage />;
  }

  const {
    firstName,
    lastName,
    marketingName,
    planName,
    policyNumber,
    policyStatus,
  } = data!;

  const statusStyle = () => {
    switch (policyStatus) {
      // TODO: how to categorize this one?
      // case PolicyStatus.NotIssued:
      //   return 'status.notIssued';
      case PolicyStatus.PENDINGISSUED:
      case PolicyStatus.ACTIVE:
        return styles.success;
      case PolicyStatus.PENDINGLAPSE:
        return styles.warning;
      case PolicyStatus.LAPSE:
        return styles.error;
      default:
        return '';
    }
  };

  const insuredName = fullName({ firstName, lastName });

  return (
    <div
      className={clsx(styles.container, { [`${className}`]: className })}
      style={style}
    >
      <p className="typography-labels-label-lg-alt">
        {`${marketingName || ''} ${marketingName && planName ? '-' : ''} ${planName || ''}`}
      </p>
      <div className={styles.policyDetails}>
        <p className="typography-labels-label-md-alt">
          Policy No. {`${checkIfNull(policyNumber)}`}
        </p>
        <p className="typography-labels-label-md-alt">
          {`Insured: ${insuredName}`}
        </p>
        <p className="typography-labels-label-md-alt">
          Policy status:{' '}
          <span className={statusStyle()}>
            {checkIfNull(toSentenceCase(policyDisplayText[policyStatus]))}
          </span>
        </p>
      </div>
    </div>
  );
};
