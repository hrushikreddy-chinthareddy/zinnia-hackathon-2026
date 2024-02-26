import {
  Label,
  Icon,
  IconType,
  Popover,
  PopoverPlacement,
} from '@zinnia/bloom/components-internal';

import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { formatUSDollars } from '@/utils/currency';

import styles from './PolicyOverview.module.css';

const UPCOMING_PREMIUM = 'Upcoming premium';

const UpcomingPremiumPopover = () => {
  return (
    <Popover
      title="Upcoming premium"
      trigger={
        <Icon
          type={IconType.CIRCLE_INFO}
          width={16}
          height={16}
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

export const UpcomingPremium = () => {
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
              interactiveElements={
                // eslint-disable-next-line react/jsx-key
                [<UpcomingPremiumPopover />]
              }
            >
              {UPCOMING_PREMIUM}
            </Label>
          }
          caption="Autopay on 11/12/2023"
        >
          <p className="typography-content-value">{formatUSDollars(281.45)}</p>
        </FieldData>
      </div>
    </ClickableCardContainer>
  );
};
