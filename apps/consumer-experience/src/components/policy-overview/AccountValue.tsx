'use client';

import {
  Label,
  Icon,
  IconType,
  Popover,
  PopoverPlacement,
  Ticker,
} from '@zinnia/bloom/internal/components';

import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { PolicyAccountValue, PolicyStatus } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';
import { isNullEmptyOrUndefined } from '@/utils/data';
import { dateMonthWithTimeEST } from '@/utils/dates';
import { DEFAULT_UNAVAILABLE_STRING } from '@/utils/strings';

import styles from './PolicyOverview.module.css';

const AccountValuePopover = () => {
  return (
    <Popover
      title={ACCOUNT_VALUE}
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

const ACCOUNT_VALUE = 'Account value';

export interface Props extends PolicyAccountValue {
  policyStatus: PolicyStatus;
}

// TODO: add surrendered and locked policy states
export const AccountValue = ({
  totalFundValue,
  timestamp,
  valueChange,
}: Props) => {
  const totalFundContent = isNullEmptyOrUndefined(totalFundValue) ? (
    <p className="typography-content-body-sm">{DEFAULT_UNAVAILABLE_STRING}</p>
  ) : (
    <p className="typography-content-value">
      {formatUSDollars(totalFundValue)}
    </p>
  );

  return (
    <ClickableCardContainer
      linkTo={{ url: '#', isInternal: true, label: 'go to internal link' }}
    >
      <div className={styles.rowWrapper}>
        <div className={styles.content}>
          <Icon type={IconType.DOLLAR} className={styles.icon} />
          <FieldData
            large
            Label={
              <Label
                interactiveElements={[
                  <AccountValuePopover key="account-value-popover" />,
                ]}
              >
                {ACCOUNT_VALUE}
              </Label>
            }
            caption={
              timestamp ? `As of ${dateMonthWithTimeEST(timestamp)}` : ''
            }
          >
            {totalFundContent}
          </FieldData>
        </div>
        <div className={styles.additionalInfo}>
          {/* TODO: still need to figure out what this month comes from  */}
          <Ticker value={valueChange} subtext="this month" />
        </div>
      </div>
    </ClickableCardContainer>
  );
};
