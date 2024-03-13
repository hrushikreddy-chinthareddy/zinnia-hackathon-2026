import { PolicyStatus } from '@zinnia/api-types/types/sor';
import { Label, Icon, IconType } from '@zinnia/bloom/internal/components';
import { headers } from 'next/headers';

import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { UpcomingPremiumPopover } from '@/components/policy-overview/UpcomingPremiumPopover';
import { getUpcomingPremium } from '@/services';
import { formatUSDollars } from '@/utils/currency';
import { isNullEmptyOrUndefined } from '@/utils/data';
import { standardDateMonthYear } from '@/utils/dates';
import { DEFAULT_UNAVAILABLE_STRING } from '@/utils/strings';

import styles from './PolicyOverview.module.css';

const UPCOMING_PREMIUM = 'Upcoming premium';

export const UpcomingPremium = async () => {
  const headerStore = headers();

  const { data, error } = await getUpcomingPremium({
    planCode: headerStore.get('planCode') || '',
    policyNumber: headerStore.get('policyNumber') || '',
  });

  if (error) {
    return null;
  }

  const {
    amount,
    nextActivityDate,
    policyStatus,
    planName: policyName,
  } = data!;
  let currentAmount = amount;

  // TODO: add locked status here once confirmed what that is
  if (policyStatus === PolicyStatus.LAPSE) {
    currentAmount = 0;
  }

  // TODO: add locked status here
  const paymentCaption = () => {
    if (policyStatus === PolicyStatus.LAPSE) {
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
