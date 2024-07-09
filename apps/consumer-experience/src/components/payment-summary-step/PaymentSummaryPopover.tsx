import {
  Icon,
  IconType,
  Popover,
  PopoverPlacement,
} from '@zinnia/bloom/components';

import styles from './PaymentSummaryStep.module.css';

export const PaymentSummaryPopover = ({
  tooltipTitle,
  tooltipText,
}: {
  tooltipTitle: string;
  tooltipText: string;
}) => {
  return (
    <Popover
      title={tooltipTitle}
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
        <p>{tooltipText}</p>
      </div>
    </Popover>
  );
};
