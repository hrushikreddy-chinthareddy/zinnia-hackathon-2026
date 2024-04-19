import {
  Icon,
  IconType,
  Popover,
  PopoverPlacement,
} from '@zinnia/bloom/internal/components';

import styles from './PolicyOverview.module.css';

const COVERAGE = 'Coverage';

export const CoveragePopover = () => {
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
          Rest assured, you’re insured for this amount as long as your policy is
          active. Your coverage amount is also referred to as the policy’s
          “death benefit.” If something happens to you, your beneficiaries can
          claim this amount.
        </p>
      </div>
    </Popover>
  );
};
