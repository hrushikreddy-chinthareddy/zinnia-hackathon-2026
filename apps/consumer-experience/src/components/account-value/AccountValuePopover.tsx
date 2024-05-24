import {
  Icon,
  IconType,
  Popover,
  PopoverPlacement,
} from '@zinnia/bloom/internal/components';

import { standardDateMonthDayYear } from '@/utils/dates';

import styles from '../policy-overview/PolicyOverview.module.css';
const ACCOUNT_VALUE = 'Account value';

export const AccountValuePopover = ({
  dataTimestamp,
}: {
  dataTimestamp?: string | null;
}) => {
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
        <p>
          {`This is how much money is held in your policy as of ${standardDateMonthDayYear(dataTimestamp)}.
          Policy value may grow over time as the premium dollars allocated to
          your account value earn interest. This money is yours to use how you
          see fit. You could take out a loan against it or even withdraw some
          for income in retirement or to pay for college. Note, though, that
          withdrawals and loans (until paid back) can reduce your death benefit.
          You could also simply let the account value grow, and eventually use
          it to pay policy charges. If you go this route, you’ll just want to
          keep an eye on the account value and the cost of your insurance over
          time. If the policy isn’t funded enough, it could lapse, leaving you
          without coverage.`}
        </p>
      </div>
    </Popover>
  );
};
