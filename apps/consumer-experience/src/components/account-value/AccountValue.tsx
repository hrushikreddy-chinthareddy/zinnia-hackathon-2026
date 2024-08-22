'use client';
import { useQuery } from '@tanstack/react-query';
import { Icon, IconType, Label, Ticker } from '@zinnia/bloom/components';
import { DEFAULT_UNAVAILABLE_STRING } from '@zinnia/utils';
import { HTMLAttributes } from 'react';

import { getPolicyAccountValue } from '@/queries/policy-queries';
import { QueryKeys } from '@/queries/query-keys';
import { PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';
import { isNullEmptyOrUndefined } from '@/utils/data';
import { standardDateMonthDayYear } from '@/utils/dates';

import { AccountValuePopover } from './AccountValuePopover';
import { FieldData } from '../field-data/FieldData';
import styles from '../policy-overview/PolicyOverview.module.css';

const ACCOUNT_VALUE = 'Account value';

interface Props extends PolicyRequestInputs, HTMLAttributes<HTMLDivElement> {
  hideLabel?: boolean;
  hideTicker?: boolean;
  isLink?: boolean;
  showIcon?: boolean;
}

export const AccountValue = ({
  className,
  hideLabel,
  hideTicker,
  isLink,
  planCode,
  policyNumber,
  showIcon,
}: Props) => {
  const { data } = useQuery({
    queryKey: [QueryKeys.POLICY_ACCOUNT_VALUE],
    // TODO: what should this be?
    // initialData: [],
    queryFn: () => getPolicyAccountValue(planCode, policyNumber),
  });

  if (!data) {
    return null;
  }

  console.log(data);

  const { endingAccountValue, effectiveDate, valueChange } = data!;

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
