import clsx from 'clsx';

import { FullName } from '@/components/pii/FullName';
import { CarrierPolicyDetails } from '@/types/policy';
import {
  checkIfNull,
  isAnnuity,
  lineOfBusinessDisplayText,
  policyStatusDisplayText,
} from '@/utils/data';
import { toSentenceCase } from '@/utils/strings';
import { PolicyStatus } from '@zinnia/api-types/types/sor';

import styles from './PolicyDetailsSummary.module.css';

interface DetailProps {
  className?: string;
  planCode: string;
  policyNumber: string;
  summary: Partial<CarrierPolicyDetails>;
}

export const PolicyDetailsSummary = ({
  summary,
  className,
  policyNumber,
}: DetailProps) => {
  const { firstName, lastName, marketingName, policyStatus, lineOfBusiness } =
    summary;

  const statusStyle = () => {
    switch (policyStatus) {
      case PolicyStatus.PENDINGISSUED:
      case PolicyStatus.ACTIVE:
        return styles.success;
      case PolicyStatus.PENDINGLAPSE:
        return styles.warning;
      case PolicyStatus.LAPSE:
      case PolicyStatus.SURRENDERED:
      case PolicyStatus.CANCELEDFREELOOK:
        return styles.error;
      default:
        return '';
    }
  };

  return (
    <div className={clsx(styles.container, { [`${className}`]: className })}>
      <p className="typography-labels-label-md-alt">
        <span>{marketingName || ''}</span>
      </p>
      <div className={styles.policyDetails}>
        <p className="typography-labels-label-sm-alt">{`${toSentenceCase(lineOfBusinessDisplayText(lineOfBusiness))} #: ${checkIfNull(policyNumber)}`}</p>

        <>
          <p className="typography-labels-label-sm-alt">
            <span>{isAnnuity(lineOfBusiness) ? 'Annuitant' : 'Insured'}</span>:{' '}
            <FullName firstName={firstName} lastName={lastName} />
          </p>
          {policyStatus && (
            <p className="typography-labels-label-sm-alt">
              Status:{' '}
              <span className={statusStyle()}>
                {checkIfNull(
                  toSentenceCase(policyStatusDisplayText[policyStatus])
                )}
              </span>
            </p>
          )}
        </>
      </div>
    </div>
  );
};
