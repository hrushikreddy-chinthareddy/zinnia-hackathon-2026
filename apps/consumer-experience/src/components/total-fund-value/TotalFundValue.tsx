import { Label, Icon, IconType } from '@zinnia/bloom/components';
import { HTMLAttributes } from 'react';

import { AccountValuePopover } from '@/components/account-value/AccountValuePopover';
import { FieldData } from '@/components/field-data/FieldData';
import { getFundsTotalValue } from '@/services/funds';
import { PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';

import styles from '../policy-overview/PolicyOverview.module.css';

const TOTAL_FUND_VALUE = 'Total fund value';

interface Props extends PolicyRequestInputs, HTMLAttributes<HTMLDivElement> {
  hideLabel?: boolean;
  hideTicker?: boolean;
  isLink?: boolean;
  showIcon?: boolean;
}

export const TotalFundValue = async ({
  className,
  hideLabel,
  planCode,
  policyNumber,
  showIcon,
}: Props) => {
  const { data, error } = await getFundsTotalValue({
    planCode,
    policyNumber,
  });

  if (error || !data) {
    return null;
  }

  console.log('TOTAL FUND +++++++', data);

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
                    // dataTimestamp={effectiveDate}
                  />,
                ]}
              >
                {TOTAL_FUND_VALUE}
              </Label>
            ),
          })}
          caption={
            <span>{`Outstanding loan: ${formatUSDollars(null, true)}`}</span>
          }
        >
          <p className="typography-content-value">
            {formatUSDollars(data.fundsTotalValue)}
          </p>
        </FieldData>
      </div>
    </div>
  );
};
