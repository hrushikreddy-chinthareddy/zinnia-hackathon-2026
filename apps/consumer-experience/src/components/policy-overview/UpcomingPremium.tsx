import { PolicyStatus } from '@zinnia/api-types/types/sor';
import { Label, Icon, IconType } from '@zinnia/bloom/internal/components';

import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import MockMessage from '@/components/MockMessage';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { UpcomingPremiumPopover } from '@/components/policy-overview/UpcomingPremiumPopover';
import { getUpcomingPremium } from '@/services';
import { formatUSDollars } from '@/utils/currency';
import { isNullEmptyOrUndefined } from '@/utils/data';
import { standardDateMonthYear } from '@/utils/dates';
import { DEFAULT_UNAVAILABLE_STRING } from '@/utils/strings';

import styles from './PolicyOverview.module.css';

const UPCOMING_PREMIUM = 'Upcoming premium';

export const UpcomingPremium = async ({
  planCode,
  policyNumber,
  extended,
}: {
  planCode: string;
  policyNumber: string;
  extended?: boolean;
}) => {
  const { data, error } = await getUpcomingPremium({
    planCode,
    policyNumber,
  });

  if (error) {
    return (
      <div className="space-mb-gap-lg">
        <MockMessage />
        <NoDataAvailable
          iconType={IconType.AUTOPAY}
          message="There is currently no premium payments data available."
        />
      </div>
    );
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
      linkTo={{
        url: extended ? '' : `/policies/${planCode}/${policyNumber}/premium`,
        label: 'go to premium payments page',
      }}
      {...(extended && {
        listItems: [
          {
            content: (
              <span className="typography-labels-field-label my-lg">
                Payment history
              </span>
            ),
            linkTo: {
              url: `/policies/${planCode}/${policyNumber}/premium/payment-history`,
              label: 'go to payment history page',
            },
          },
          {
            content: (
              <span className="typography-labels-field-label my-lg">
                Payment details
              </span>
            ),
            linkTo: {
              url: `/policies/${planCode}/${policyNumber}/premium/payment-details`,
              label: 'go to payment details page',
            },
          },
        ],
      })}
    >
      <div className={styles.content}>
        <Icon type={IconType.AUTOPAY} className={styles.icon} />
        <FieldData
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
