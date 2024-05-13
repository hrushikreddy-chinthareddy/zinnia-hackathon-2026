import {
  Label,
  Icon,
  IconType,
  Ticker,
} from '@zinnia/bloom/internal/components';
import { HTMLAttributes } from 'react';

import { AccountValuePopover } from '@/components/account-value/AccountValuePopover';
import { FieldData } from '@/components/field-data/FieldData';
import { getPolicyAccountValueWith30DayChange } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';
import { isNullEmptyOrUndefined } from '@/utils/data';
import { standardDateWithTimeEST } from '@/utils/dates';
import { DEFAULT_UNAVAILABLE_STRING } from '@/utils/strings';

import styles from '../policy-overview/PolicyOverview.module.css';

const ACCOUNT_VALUE = 'Account value';

interface Props extends PolicyRequestInputs, HTMLAttributes<HTMLDivElement> {
  hideLabel?: boolean;
  hideTicker?: boolean;
  isLink?: boolean;
  showIcon?: boolean;
}

export const AccountValue = async ({
  className,
  hideLabel,
  hideTicker,
  isLink,
  planCode,
  policyNumber,
  showIcon,
}: Props) => {
  const { data, error } = await getPolicyAccountValueWith30DayChange({
    planCode,
    policyNumber,
  });

  if (error || !data) {
    return null;
  }

  const { totalFundValue, timestamp, valueChange, policyStartDate } = data!;

  const totalFundContent = isNullEmptyOrUndefined(totalFundValue) ? (
    <p className="typography-content-body-sm">{DEFAULT_UNAVAILABLE_STRING}</p>
  ) : (
    <p className="typography-content-value">
      {formatUSDollars(totalFundValue)}
    </p>
  );

  return (
    <div className={`${styles.rowWrapper} ${className}`}>
      <div className={styles.content}>
        {showIcon && <Icon type={IconType.DOLLAR} className={styles.icon} />}
        <FieldData
          {...(!hideLabel && {
            Label: (
              <Label
                interactiveElements={[
                  <AccountValuePopover
                    key="account-value-popover"
                    policyStartDate={policyStartDate}
                  />,
                ]}
              >
                {ACCOUNT_VALUE}
              </Label>
            ),
          })}
          caption={
            timestamp ? `As of ${standardDateWithTimeEST(timestamp)}` : ''
          }
        >
          {totalFundContent}
        </FieldData>
      </div>
      {!hideTicker && (
        <div className={!isLink ? 'ml-lg' : 'mr-lg ml-md'}>
          <Ticker value={valueChange} subtext="Last 30 days" />
        </div>
      )}
    </div>
  );
};
