/* eslint-disable react/jsx-key */
import { Label } from '@zinnia/bloom/components';
import clsx from 'clsx';
import React from 'react';

import { formatUSDollars } from '@/utils/currency';

import { PaymentSummaryPopover } from './PaymentSummaryPopover';
import styles from './PaymentSummaryStep.module.css';
import { calculateTotalDeposit } from './utils';

export interface PaymentSummaryStepProps {
  className?: string;
  transactionSummary: Array<{
    label: string;
    value: number;
    tooltipText?: string;
  }>;
  sumTotalText: string;
}

export const PaymentSummaryStep = ({
  className,
  transactionSummary,
}: PaymentSummaryStepProps) => {
  const totalDeposit = calculateTotalDeposit(transactionSummary);

  return (
    <div className={clsx(styles.paymentSummaryStepContainer, className)}>
      {transactionSummary.map(({ label, value, tooltipText }, index) => (
        <div key={index} className={styles.paymentSummarySection}>
          {/* TODO: Add className to Label component and remove wrapping div */}
          <div className={styles.paymentSummaryLabel}>
            {tooltipText ? (
              <Label
                interactiveElements={[
                  <PaymentSummaryPopover
                    key={label}
                    tooltipTitle={label}
                    tooltipText={tooltipText}
                  />,
                ]}
              >
                {label}
              </Label>
            ) : (
              <Label>{label}</Label>
            )}
          </div>
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
        <div className={styles.paymentSummaryLabel}>
          <Label>Total Deposit</Label>
        </div>
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
