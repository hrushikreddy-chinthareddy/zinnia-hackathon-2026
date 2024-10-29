import { Label } from '@zinnia/bloom/components';
import { HTMLAttributes } from 'react';

import { FieldData } from '@/components/field-data/FieldData';
import { getPolicyDetails } from '@/services';
import { getFundsTotalValue } from '@/services/funds';
import { PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';

import { LabelPopover } from '../label-popover/LabelPopover';

const TOTAL_FUND_VALUE = 'Total fund value';

interface Props extends PolicyRequestInputs, HTMLAttributes<HTMLDivElement> {
  hideLabel?: boolean;
  hideTicker?: boolean;
  isLink?: boolean;
  showIcon?: boolean;
}

export const TotalFundValue = async ({
  hideLabel,
  planCode,
  policyNumber,
}: Props) => {
  const [totalFunds, policyData] = await Promise.allSettled([
    getFundsTotalValue({ planCode, policyNumber }),
    getPolicyDetails({ planCode, policyNumber }),
  ]);
  let outstandingLoan;
  let totalFundsVal;
  if (totalFunds.status === 'rejected' || policyData.status === 'rejected') {
    outstandingLoan = 0;
    totalFundsVal = 0;
  } else {
    outstandingLoan =
      policyData.value?.data?.accountValues?.loanedPortionOfAccountValue;
    totalFundsVal = totalFunds.value?.data?.fundsTotalValue;
  }

  return (
    <FieldData
      {...(!hideLabel && {
        Label: (
          <Label
            interactiveElements={[
              <LabelPopover title={TOTAL_FUND_VALUE} key={TOTAL_FUND_VALUE}>
                <p>
                  This is the amount of your account value currently allocated
                  in this specific fund. It's often the same amount as the
                  account value, but may differ if you have any outstanding
                  loans from the policy.
                </p>
              </LabelPopover>,
            ]}
          >
            {TOTAL_FUND_VALUE}
          </Label>
        ),
      })}
      caption={
        <span>{`Outstanding loan: ${formatUSDollars(outstandingLoan, true)}`}</span>
      }
    >
      <p className="typography-content-value">
        {formatUSDollars(totalFundsVal)}
      </p>
    </FieldData>
  );
};
