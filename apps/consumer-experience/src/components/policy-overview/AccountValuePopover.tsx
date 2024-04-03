import {
  Icon,
  IconType,
  Popover,
  PopoverPlacement,
} from '@zinnia/bloom/internal/components';

import styles from './PolicyOverview.module.css';
const ACCOUNT_VALUE = 'Account value';

export const AccountValuePopover = () => {
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
          Cha-ching! This is how much money is held in your policy right now.
          Account value grows over time as the premiums you pay are invested and
          earn interest. This money is yours to use how you see fit. You could
          take out a loan against it or even withdraw some for income in
          retirement or to pay for college. Note, though, that withdrawals and
          loans (until paid back) can reduce your death benefit. You could also
          simply let the cash value grow, and eventually use it to pay premiums.
          If you go this route, you’ll just want to keep an eye on the account
          value and the cost of your insurance over time. If the policy isn’t
          funded enough, it could lapse, leaving you without coverage.
        </p>
      </div>
    </Popover>
  );
};
