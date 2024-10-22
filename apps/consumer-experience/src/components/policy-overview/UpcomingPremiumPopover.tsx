'use client';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import {
  Icon,
  IconType,
  Popover,
  PopoverPlacement,
} from '@zinnia/bloom/components';

import styles from './PolicyOverview.module.css';
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
    <Popover
      title={UPCOMING_PREMIUM}
      trigger={
        <Icon
          type={IconType.CIRCLE_INFO}
          small
          color="var(--color-base-icon-icon-tooltip)"
        />
      }
      placement={PopoverPlacement.BottomRight}
    >
      <div className={styles.popoverContent}>
        <p>{content}</p>
      </div>
    </Popover>
  );
};
