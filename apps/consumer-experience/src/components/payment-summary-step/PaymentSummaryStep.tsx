import { type LabelProps } from '@zinnia/bloom/components';
import clsx from 'clsx';
import React from 'react';

import { formatUSDollars } from '@/utils/currency';

import styles from './PaymentSummaryStep.module.css';
import { calculateTotalDeposit } from './utils';

export interface TransactionSummaryItem {
  label: React.ReactElement<LabelProps>;
  value?: number;
}

export interface PaymentSummaryStepProps {
  className?: string;
  transactionSummary: TransactionSummaryItem[];
  totalLabel: React.ReactElement<LabelProps>;
}

export const PaymentSummaryStep = ({
  className,
  transactionSummary,
  totalLabel,
}: PaymentSummaryStepProps) => {
  console.log(transactionSummary);
  const totalDeposit = calculateTotalDeposit(transactionSummary);

  return (
    <div className={clsx(styles.paymentSummaryStepContainer, className)}>
      {transactionSummary.map(({ label, value }, index) => (
        <div key={index} className={styles.paymentSummarySection}>
          <div className={styles.paymentSummaryLabel}>{label}</div>
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

      {/* TODO: Add className to Label component and remove wrapping div */}
      <div className={styles.paymentSummarySection}>
        <div className={styles.paymentSummaryLabel}>{totalLabel}</div>
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
