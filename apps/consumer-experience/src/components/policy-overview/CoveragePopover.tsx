import {
  Icon,
  IconType,
  Popover,
  PopoverPlacement,
} from '@zinnia/bloom/components';

import styles from './PolicyOverview.module.css';

const COVERAGE = 'Coverage';

export const CoveragePopover = () => {
  return (
    <Popover
      title={COVERAGE}
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
        <p>
          You’re insured for this amount. Your coverage amount may also be
          referred to as the "face amount," the amount of money stated in your
          insurance contract.
        </p>
      </div>
    </Popover>
  );
};
