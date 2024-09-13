import { Label } from '@zinnia/bloom/components';
import { HTMLAttributes } from 'react';

import { FieldData } from '@/components/field-data/FieldData';
import { getPolicyDetails } from '@/services';
import { getFundsTotalValue } from '@/services/funds';
import { PolicyRequestInputs } from '@/types/policy';
import { formatUSDollars } from '@/utils/currency';

import { LabelPopover } from '../label-popover/LabelPopover';

const OUTSTANDING_LOAN = 'Outstanding loan';

interface Props extends PolicyRequestInputs, HTMLAttributes<HTMLDivElement> {
  hideLabel?: boolean;
  hideTicker?: boolean;
  isLink?: boolean;
  showIcon?: boolean;
}

export const OutstandingLoanValue = async ({
  hideLabel,
  planCode,
  policyNumber,
}: Props) => {
  const [totalFunds, policyData] = await Promise.allSettled([
    getFundsTotalValue({ planCode, policyNumber }),
    getPolicyDetails({ planCode, policyNumber }),
  ]);
  let outstandingLoan;
  if (totalFunds.status === 'rejected' || policyData.status === 'rejected') {
    outstandingLoan = 0;
  } else {
    outstandingLoan =
      policyData.value?.data?.accountValues?.loanedPortionOfAccountValue;
  }

  return (
    <FieldData
      {...(!hideLabel && {
        Label: (
          <Label
            interactiveElements={[
              <LabelPopover
                title={OUTSTANDING_LOAN}
                key={OUTSTANDING_LOAN}
                content={
                  <p>
                    If you have an outstanding loan, this money is still part of
                    your policy's value but is not held within any selected
                    accounts.
                  </p>
                }
              />,
            ]}
          >
            {OUTSTANDING_LOAN}
          </Label>
        ),
      })}
    >
      <p className="typography-content-value">
        {formatUSDollars(outstandingLoan, true)}
      </p>
    </FieldData>
  );
};
