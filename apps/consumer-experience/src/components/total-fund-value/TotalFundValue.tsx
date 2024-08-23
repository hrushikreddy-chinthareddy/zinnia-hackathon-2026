import { Label, Icon, IconType } from '@zinnia/bloom/components';
import { HTMLAttributes } from 'react';

import { FieldData } from '@/components/field-data/FieldData';
import { getPolicyDetails } from '@/services';
import { getFundsTotalValue } from '@/services/funds';
import { PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';

import { LabelPopover } from '../label-popover/LabelPopover';
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

  const { data: policyData } = await getPolicyDetails({
    planCode,
    policyNumber,
  });

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
                  <LabelPopover
                    title={TOTAL_FUND_VALUE}
                    key={TOTAL_FUND_VALUE}
                    content={
                      <p>
                        This is the amount of your account value currently
                        invested in funds. It’s often the same amount as the
                        account value, but may differ if you have any
                        outstanding loans from the policy.
                      </p>
                    }
                  />,
                ]}
              >
                {TOTAL_FUND_VALUE}
              </Label>
            ),
          })}
          caption={
            <span>{`Outstanding loan: ${formatUSDollars(policyData?.accountValues?.loanedPortionOfAccountValue, true)}`}</span>
          }
        >
          <p className="typography-content-value">
            {formatUSDollars(data?.fundsTotalValue)}
          </p>
        </FieldData>
      </div>
    </div>
  );
};
