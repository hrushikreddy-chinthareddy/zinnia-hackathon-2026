"use client"

import {
  Label,
  Icon,
  IconType,
  Popover,
  PopoverPlacement,
} from '@zinnia/bloom/internal/components';

import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import {
  PolicyStatus,
  UpcomingPremium as UpcomingPremiumType,
} from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';
import { standardDateMonthYear } from '@/utils/dates';

import styles from './PolicyOverview.module.css';

interface Props extends UpcomingPremiumType {
  policyStatus: PolicyStatus;
}

const UPCOMING_PREMIUM = 'Upcoming premium';

const UpcomingPremiumPopover = () => {
  return (
    <Popover
      title={UPCOMING_PREMIUM}
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
          Your premium is the amount you pay periodically for insurance
          coverage. What’s shown here is your next scheduled payment.
        </p>
        <p>
          In exchange for your premium payments, we’ll make sure your
          beneficiaries can claim your coverage amount should something happen
          to you. But the benefits don’t stop there. Since you own a [Product
          marketing name], a portion of your premium is deposited into your
          account value and invested. Over time, you may be able tp use the
          account value for loans, withdrawals, or to pay the cost of your
          insurance.
        </p>
      </div>
    </Popover>
  );
};

export const UpcomingPremium = ({
  amount,
  nextActivityDate,
  policyStatus,
}: Props) => {
  if (amount == null) {
    return null;
  }

  let currentAmount = amount;

  // TODO: add locked status here once confirmed what that is
  if (policyStatus === PolicyStatus.Lapse) {
    currentAmount = 0;
  }

  // TODO: add locked status here
  const paymentCaption = () => {
    if (policyStatus === PolicyStatus.Lapse) {
      return <span className={styles.error}>Payment</span>;
    }

    return nextActivityDate
      ? `Autopay on ${standardDateMonthYear(nextActivityDate)}`
      : '';
  };

  return (
    <ClickableCardContainer
      linkTo={{ url: '#', isInternal: true, label: 'go to internal link' }}
    >
      <div className={styles.content}>
        <Icon type={IconType.AUTOPAY} className={styles.icon} />
        <FieldData
          large
          Label={
            <Label
              interactiveElements={[
                <UpcomingPremiumPopover key="upcoming-popover" />,
              ]}
            >
              {UPCOMING_PREMIUM}
            </Label>
          }
          caption={paymentCaption()}
        >
          <p className="typography-content-value">
            {formatUSDollars(currentAmount)}
          </p>
        </FieldData>
      </div>
    </ClickableCardContainer>
  );
};
