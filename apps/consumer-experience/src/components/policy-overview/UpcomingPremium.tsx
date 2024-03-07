'use client';

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
import { isNullEmptyOrUndefined } from '@/utils/data';
import { standardDateMonthYear } from '@/utils/dates';
import { DEFAULT_UNAVAILABLE_STRING } from '@/utils/strings';

import styles from './PolicyOverview.module.css';

export interface Props extends UpcomingPremiumType {
  policyStatus: PolicyStatus;
  policyName: string;
}

const UPCOMING_PREMIUM = 'Upcoming premium';

const UpcomingPremiumPopover = ({ policyName }: { policyName: string }) => {
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
          {`In exchange for your premium payments, we’ll make sure your
          beneficiaries can claim your coverage amount should something happen
          to you. But the benefits don’t stop there. Since you own a ${policyName}, a portion of your premium is deposited into your
          account value and invested. Over time, you may be able to use the
          account value for loans, withdrawals, or to pay the cost of your
          insurance.`}
        </p>
      </div>
    </Popover>
  );
};

export const UpcomingPremium = ({
  amount,
  nextActivityDate,
  policyStatus,
  policyName,
}: Props) => {
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

  const upcomingPremContent = isNullEmptyOrUndefined(currentAmount) ? (
    <p className="typography-content-body-sm">{DEFAULT_UNAVAILABLE_STRING}</p>
  ) : (
    <p className="typography-content-value">{formatUSDollars(currentAmount)}</p>
  );

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
                <UpcomingPremiumPopover
                  key="upcoming-popover"
                  policyName={policyName}
                />,
              ]}
            >
              {UPCOMING_PREMIUM}
            </Label>
          }
          caption={paymentCaption()}
        >
          {upcomingPremContent}
        </FieldData>
      </div>
    </ClickableCardContainer>
  );
};
