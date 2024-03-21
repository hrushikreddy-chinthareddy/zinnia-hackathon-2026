import {
  Label,
  Icon,
  IconType,
  Ticker,
} from '@zinnia/bloom/internal/components';
import { headers } from 'next/headers';

import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { FieldData } from '@/components/field-data/FieldData';
import { AccountValuePopover } from '@/components/policy-overview/AccountValuePopover';
import { getPolicyAccountValue } from '@/services';
import { formatUSDollars } from '@/utils/currency';
import { isNullEmptyOrUndefined } from '@/utils/data';
import { dateMonthWithTimeEST } from '@/utils/dates';
import { DEFAULT_UNAVAILABLE_STRING } from '@/utils/strings';

import styles from './PolicyOverview.module.css';

const ACCOUNT_VALUE = 'Account value';

// TODO: add surrendered and locked policy states
export const AccountValue = async () => {
  const headerStore = headers();

  const { data, error } = await getPolicyAccountValue({
    planCode: headerStore.get('planCode') || '',
    policyNumber: headerStore.get('policyNumber') || '',
  });

  if (error) {
    return null;
  }

  const { totalFundValue, timestamp, valueChange } = data!;

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
