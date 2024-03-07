import clsx from 'clsx';

import { PolicyDetails, PolicyStatus } from '@/types/policy';
import { checkIfNull, fullName } from '@/utils/data';
import { toSentenceCase } from '@/utils/strings';

import styles from './HeaderPolicyDetails.module.css';

interface Props extends PolicyDetails, React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  policyStatus: PolicyStatus;
}

// TODO: add surrendered and locked statuses
const policyDisplayText: { [key in PolicyStatus]: string } = {
  [PolicyStatus.Active]: 'active',
  [PolicyStatus.PendingIssued]: 'active',
  [PolicyStatus.PendingLapse]: 'pending lapse',
  [PolicyStatus.Lapse]: 'lapsed',
  // TODO: what is the display for this one?
  [PolicyStatus.NotIssued]: '',
};

export const HeaderPolicyDetails = ({
  className,
  firstName,
  lastName,
  marketingName,
  planName,
  policyNumber,
  policyStatus,
  style,
}: Props) => {
  const statusStyle = () => {
    switch (policyStatus) {
      // TODO: how to categorize this one?
      // case PolicyStatus.NotIssued:
      //   return 'status.notIssued';
      case PolicyStatus.PendingIssued:
      case PolicyStatus.Active:
        return styles.success;
      case PolicyStatus.PendingLapse:
        return styles.warning;
      case PolicyStatus.Lapse:
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
