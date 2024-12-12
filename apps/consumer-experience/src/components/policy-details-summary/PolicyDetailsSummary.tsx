import { PolicyStatus } from '@zinnia/api-types/types/sor';
import clsx from 'clsx';

import { FullName } from '@/components/pii/FullName';
import { checkResetDeliveryDateEligibility } from '@/services/bpm';
import { CarrierPolicyDetails } from '@/types/policy';
import {
  checkIfNull,
  isAnnuity,
  lineOfBusinessDisplayText,
  policyStatusDisplayText,
} from '@/utils/data';
import { toSentenceCase } from '@/utils/strings';

import styles from './PolicyDetailsSummary.module.css';

interface DetailProps {
  className?: string;
  planCode: string;
  policyNumber: string;
  summary: CarrierPolicyDetails;
}

export const PolicyDetailsSummary = async ({
  summary,
  className,
  policyNumber,
  planCode,
}: DetailProps) => {
  const { firstName, lastName, marketingName, policyStatus, lineOfBusiness } =
    summary;

  const { data: eligible } = await checkResetDeliveryDateEligibility({
    planCode: planCode || '',
    policyNumber: policyNumber,
  });
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
      <p className="typography-labels-label-lg-alt">
        <span>{marketingName || ''}</span>
      </p>
      {eligible.isEligible ? (
        <p className="typography-labels-label-md-alt">
          <span>Delivery date reset eligible</span>
        </p>
      ) : (
        <p className="typography-labels-label-md-alt">
          <span>Delivery date reset not eligible</span>
        </p>
      )}
      <div className={styles.policyDetails}>
        <p className="typography-labels-label-md-alt">{`${toSentenceCase(lineOfBusinessDisplayText(lineOfBusiness))} #: ${checkIfNull(policyNumber)}`}</p>

        <>
          <p className="typography-labels-label-md-alt">
            <span>{isAnnuity(lineOfBusiness) ? 'Annuitant' : 'Insured'}</span>:{' '}
            <FullName firstName={firstName} lastName={lastName} />
          </p>
          <p className="typography-labels-label-md-alt">
            Status:{' '}
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
