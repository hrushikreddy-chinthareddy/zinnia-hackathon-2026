'use client';
import { ProductType } from '@zinnia/api-types/types/sor';
import {
  Icon,
  IconType,
  Popover,
  PopoverPlacement,
} from '@zinnia/bloom/internal/components';

import { productTypeDisplay } from '@/utils/data';

import styles from './PolicyOverview.module.css';
const UPCOMING_PREMIUM = 'Upcoming premium';

export const UpcomingPremiumPopover = ({
  productType,
}: {
  productType?: ProductType;
}) => {
  return (
    <Popover
      title={UPCOMING_PREMIUM}
      trigger={
        <Icon
          type={IconType.CIRCLE_INFO}
          small
          color="var(--color-base-icon-icon-tooltip, #ff7500)"
        />
      }
      placement={PopoverPlacement.BottomRight}
    >
      <div className={styles.popoverContent}>
        <p>
          Your premium is the amount you pay periodically for insurance
          coverage. What’s shown here is your next scheduled payment. As long as
          you've complied with your policy's requirements, your beneficiaries
          may submit a claim for your coverage amount should something happen to
          you.
        </p>
        <p>
          {`But the benefits don’t stop there. Since you own a ${productTypeDisplay(productType)} policy, a portion of your premium is deposited into your account value and invested. Over time, you may be able to use the account value for loans, withdrawals, or to pay the cost of your insurance.`}
        </p>
      </div>
    </Popover>
  );
};
