import {
  Icon,
  IconType,
  Popover,
  PopoverPlacement,
} from '@zinnia/bloom/internal/components';

import { standardDateMonthDayYear } from '@/utils/dates';

import styles from './PolicyOverview.module.css';

const COVERAGE = 'Coverage';

export const CoveragePopover = ({
  dataTimestamp,
}: {
  /**
   * Timestamp returned from the API indicating data last updated
   */
  dataTimestamp?: string | null;
}) => {
  return (
    <Popover
      title={COVERAGE}
      trigger={
        <Icon
          type={IconType.CIRCLE_INFO}
          width={16}
          height={16}
          color="var(--color-base-icon-icon-tooltip, #ff7500)"
        />
      }
      placement={PopoverPlacement.BottomRight}
    >
      <div className={styles.popoverContent}>
        <p>
          {`You’re insured for this amount. Your coverage amount may also be
          referred to as the "face amount," or the amount of money stated in
          your insurance contract. If something happens to you, your
          beneficiaries may submit a claim for this amount (plus additional
          account value and minus any outstanding loans or withdrawals, if
          applicable) as of ${standardDateMonthDayYear(dataTimestamp)}. The total payout after your death is
          referred to as the "death benefit."`}
        </p>
      </div>
    </Popover>
  );
};
