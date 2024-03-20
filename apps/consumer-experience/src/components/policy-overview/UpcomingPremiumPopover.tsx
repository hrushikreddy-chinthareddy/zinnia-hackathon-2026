'use client';
import {
  Icon,
  IconType,
  Popover,
  PopoverPlacement,
} from '@zinnia/bloom/internal/components';

import styles from './PolicyOverview.module.css';
const UPCOMING_PREMIUM = 'Upcoming premium';

export const UpcomingPremiumPopover = ({
  policyName,
}: {
  policyName: string;
}) => {
  return (
    <Popover
      title={UPCOMING_PREMIUM}
      trigger={
        <Icon
          type={IconType.CIRCLE_INFO}
          small
          color="var(--color-primary-color-primary, #ff7500)"
        />
      }
      placement={PopoverPlacement.BottomRight}
    >
      <div className={styles.popoverContent}>
        <p>
          Your premium is the amount you pay periodically for insurance
          coverage. What’s shown here is your next scheduled payment.
        </p>
        <p>
          {`In exchange for your premium payments, we’ll make sure your
          beneficiaries can claim your coverage amount should something happen
          to you. But the benefits don’t stop there. Since you own a ${policyName}, a portion of your premium is deposited into your
          account value and invested. Over time, you may be able to use the
          account value for loans, withdrawals, or to pay the cost of your
          insurance.`}
        </p>
      </div>
    </Popover>
  );
};
