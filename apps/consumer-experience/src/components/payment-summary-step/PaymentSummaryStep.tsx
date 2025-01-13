import { type LabelProps } from '@zinnia/bloom/components';
import clsx from 'clsx';
import React from 'react';

import { formatUSDollars, formatUSDollarsAccounting } from '@/utils/currency';

import styles from './PaymentSummaryStep.module.css';

export interface TransactionSummaryItem {
  label: React.ReactElement<LabelProps>;
  value?: number;
}

export interface PaymentSummaryStepProps {
  className?: string;
  transactionSummary: TransactionSummaryItem[];
  total: {
    deposit: number;
    label: React.ReactElement<LabelProps>;
  };
}

export const PaymentSummaryStep = ({
  className,
  transactionSummary,
  total,
}: PaymentSummaryStepProps) => {
  return (
    <div className={clsx(styles.paymentSummaryStepContainer, className)}>
      <div className={styles.paymentSummaryValues}>
        {transactionSummary.map(({ label, value }, index) => (
          <div key={index} className={styles.paymentSummarySection}>
            <div className={styles.paymentSummaryLabel}>{label}</div>
            <p
              className={clsx(
                styles.paymentSummaryValue,
                'typography-content-body-sm'
              )}
            >
              {formatUSDollarsAccounting(value, true)}
            </p>
          </div>
        ))}
      </div>

      {/* TODO: Add className to Label component and remove wrapping div */}
      <div className={styles.paymentSummarySection}>
        <div className={styles.paymentSummaryLabel}>{total.label}</div>
        <p
          className={clsx(
            styles.paymentSummaryValue,
            'typography-content-value'
          )}
        >
          {formatUSDollars(total.deposit)}
        </p>
      </div>
    </div>
  );
};
