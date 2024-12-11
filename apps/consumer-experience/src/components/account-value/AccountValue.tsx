import { Label, Icon, IconType, Ticker } from '@zinnia/bloom/components';
import { HTMLAttributes } from 'react';

import { AccountValuePopover } from '@/components/account-value/AccountValuePopover';
import { FieldData } from '@/components/field-data/FieldData';
import { getPolicyAccountValueWith30DayChange } from '@/services';
import { PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';
import { isNullEmptyOrUndefined } from '@/utils/data';
import { standardDateMonthDayYear } from '@/utils/dates';
import { DEFAULT_UNAVAILABLE_STRING } from '@/utils/strings';

import styles from '../policy-overview/PolicyOverview.module.css';

const ACCOUNT_VALUE = 'Account value';

interface Props extends PolicyRequestInputs, HTMLAttributes<HTMLDivElement> {
  hideLabel?: boolean;
  hideTicker?: boolean;
  isLink?: boolean;
  showIcon?: boolean;
  interestRate?: number | null;
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

  const { endingAccountValue, effectiveDate, valueChange, lineOfBusiness } =
    data!;

  const totalFundContent = isNullEmptyOrUndefined(endingAccountValue) ? (
    <p className="typography-content-body-sm">{DEFAULT_UNAVAILABLE_STRING}</p>
  ) : (
    <p className="typography-content-value">
      {formatUSDollars(endingAccountValue)}
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
                    dataTimestamp={effectiveDate}
                    lineOfBusiness={lineOfBusiness}
                  />,
                ]}
              >
                {ACCOUNT_VALUE}
              </Label>
            ),
          })}
          caption={
            effectiveDate
              ? `As of ${standardDateMonthDayYear(effectiveDate)}`
              : ''
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
