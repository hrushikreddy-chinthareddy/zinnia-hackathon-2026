import {
  Icon,
  IconType,
  Popover,
  PopoverPlacement,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import React from 'react';

import { formatUSDollars } from '@/utils/currency';

import styles from './PaymentSummaryStep.module.css';

export interface PaymentSummaryStepProps {
  className?: string;
  transactionSummary: Array<{
    label: string;
    value: number;
    tooltipText: string;
  }>;
}

export const PaymentSummaryStep = ({
  className,
  transactionSummary,
}: PaymentSummaryStepProps) => {
  const calculateTotalDeposit = (
    transactions: Array<{ label: string; value: number }>
  ) => {
    const submittedAmountObj = transactions.find(
      transaction => transaction.label === 'Submitted Amount'
    );
    const submittedAmount = submittedAmountObj ? submittedAmountObj.value : 0;
    return transactions.reduce((remainingAmount, transaction) => {
      if (transaction.label !== 'Submitted Amount') {
        return remainingAmount - transaction.value;
      }
      return remainingAmount;
    }, submittedAmount);
  };

  const totalDeposit = calculateTotalDeposit(transactionSummary);

  return (
    <div className={clsx(styles.paymentSummaryStepContainer, className)}>
      {transactionSummary.map(({ label, value, tooltipText }, index) => (
        <div key={index} className={clsx(styles.paymentSummarySection)}>
          <label
            className={clsx(
              styles.paymentSummaryTooltip,
              styles.paymentSummaryLabel,
              'typography-labels-field-label'
            )}
          >
            {label}
            {tooltipText && (
              <Popover
                popoverClassName="typography-labels-field-label"
                title={label}
                trigger={
                  <Icon
                    type={IconType.CIRCLE_INFO}
                    width={16}
                    height={16}
                    color="var(--color-base-icon-icon-tooltip, #ff7500)"
                  />
                }
                placement={PopoverPlacement.BottomRight}
              >
                <div className={clsx(styles.popoverContent)}>
                  <p>{tooltipText}</p>
                </div>
              </Popover>
            )}
          </label>
          <p
            className={clsx(
              styles.paymentSummaryValue,
              'typography-content-body-sm'
            )}
          >
            {formatUSDollars(value)}
          </p>
        </div>
      ))}

      <div className={clsx(styles.paymentSummarySection)}>
        <label
          className={clsx(
            styles.paymentSummaryLabel,
            'typography-labels-field-label'
          )}
        >
          Total deposit
        </label>
        <p
          className={clsx(
            styles.paymentSummaryValue,
            'typography-content-value'
          )}
        >
          {formatUSDollars(totalDeposit)}
        </p>
      </div>
    </div>
  );
};
