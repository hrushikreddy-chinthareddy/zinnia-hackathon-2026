import { PolicyStatus } from '@zinnia/api-types/types/sor';
import clsx from 'clsx';

import { checkIfNull, fullName, policyStatusDisplayText } from '@/utils/data';
import { toSentenceCase } from '@/utils/strings';

import styles from './PolicyDetailsSummary.module.css';

interface DetailProps {
  className?: string;
  planCode: string;
  policyNumber: string;
  summary: {
    firstName: string;
    lastName: string;
    marketingName: string;
    planName: string;
    policyStatus: PolicyStatus;
  };
}

export const PolicyDetailsSummary = ({
  summary,
  className,
  policyNumber,
}: DetailProps) => {
  const { firstName, lastName, marketingName, policyStatus } = summary;
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

  return (
    <div className={clsx(styles.container, { [`${className}`]: className })}>
      <p className="typography-labels-label-lg-alt">
        <span>{marketingName || ''}</span>
      </p>
      <div className={styles.policyDetails}>
        <p className="typography-labels-label-md-alt">{`Policy No. ${checkIfNull(policyNumber)}`}</p>

        <>
          <p className="typography-labels-label-md-alt">
            {`Insured: ${insuredName}`}
          </p>
          <p className="typography-labels-label-md-alt">
            Policy status:{' '}
            <span className={statusStyle()}>
              {checkIfNull(
                toSentenceCase(policyStatusDisplayText[policyStatus])
              )}
            </span>
          </p>
        </>
      </div>
    </div>
  );
};
