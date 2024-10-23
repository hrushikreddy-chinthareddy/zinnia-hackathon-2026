import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import {
  Icon,
  IconType,
  Popover,
  PopoverPlacement,
} from '@zinnia/bloom/components';

import { standardDateMonthDayYear } from '@/utils/dates';

import styles from '../policy-overview/PolicyOverview.module.css';
const ACCOUNT_VALUE = 'Account value';

export const AccountValuePopover = ({
  dataTimestamp,
  lineOfBusiness,
}: {
  dataTimestamp?: string | null;
  lineOfBusiness?: LineOfBusiness;
}) => {
  const content =
    lineOfBusiness === LineOfBusiness.ANNUITY
      ? `This is how much money is held in your annuity as of ${standardDateMonthDayYear(dataTimestamp)}.`
      : `This is how much money is held in your policy as of ${standardDateMonthDayYear(dataTimestamp)}. Policy value may grow over time as the premium dollars allocated to your account value earn interest.`;

  return (
    <Popover
      title={ACCOUNT_VALUE}
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
        <p className="typography-content-body">{content}</p>
      </div>
    </Popover>
  );
};
