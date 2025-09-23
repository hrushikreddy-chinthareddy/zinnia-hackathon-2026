'use client';

import styles from '@/components/policy-overview/PolicyOverview.module.css';

import { LabelPopover } from '../label-popover/LabelPopover';
const UPCOMING_PREMIUM = 'Premium';

export const UpcomingPremiumPopover = () => {
  const content =
    'Your premium is the amount you pay periodically for insurance coverage.';

  return (
    <LabelPopover title={UPCOMING_PREMIUM}>
      <div className={styles.popoverContent}>
        <p>{content}</p>
      </div>
    </LabelPopover>
  );
};
