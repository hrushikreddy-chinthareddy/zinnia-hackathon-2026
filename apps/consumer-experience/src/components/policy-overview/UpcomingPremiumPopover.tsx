'use client';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';

import styles from '@/components/policy-overview/PolicyOverview.module.css';
import { LabelPopover } from '../label-popover/LabelPopover';
const UPCOMING_PREMIUM = 'Premium';

export const UpcomingPremiumPopover = ({
  lineOfBusiness,
}: {
  lineOfBusiness?: LineOfBusiness;
}) => {
  const content =
    lineOfBusiness === LineOfBusiness.ANNUITY
      ? "Your premium is the amount you pay into your annuity contract. What's shown here is what you've paid so far."
      : 'Your premium is the amount you pay periodically for insurance coverage. What’s shown here is your next scheduled payment.';

  return (
    <LabelPopover title={UPCOMING_PREMIUM}>
      <div className={styles.popoverContent}>
        <p>{content}</p>
      </div>
    </LabelPopover>
  );
};
