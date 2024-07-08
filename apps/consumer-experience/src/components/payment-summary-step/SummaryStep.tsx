import {
  Icon,
  IconType,
  Popover,
  PopoverPlacement,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import dayjs from 'dayjs';
import React, { useEffect, useRef, useState } from 'react';

import { formatUSDollars } from '@/utils/currency';

import styles from './SummaryStep.module.css';

export interface SummaryStepProps {
  className?: string;
  payorName: string;
  effectiveDate: string;
  bankDetails: { accountNumber: string; branchName: string };
  submittedAmount: number;
  fees: number;
  feesTooltipText: string;
}

export const SummaryStep = ({
  className,
  payorName,
  effectiveDate,
  bankDetails,
  submittedAmount,
  fees,
  feesTooltipText,
}: SummaryStepProps) => {
  const [labelWidth, setLabelWidth] = useState(0);
  const [hrWidth, setHrWidth] = useState(0);
  const [valueWidth, setValueWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const totalDepositLabelRef = useRef<HTMLLabelElement>(null);
  const totalDepositHrRef = useRef<HTMLHRElement>(null);
  const totalDepositValueRef = useRef<HTMLParagraphElement>(null);
  const containerWidthRef = useRef<HTMLDivElement>(null);

  const accountNumber = bankDetails.accountNumber.slice(-4);
  const totalDeposit = submittedAmount - fees;

  useEffect(() => {
    setLabelWidth(
      totalDepositLabelRef.current?.getBoundingClientRect().width ?? 0
    );
    setHrWidth(totalDepositHrRef.current?.getBoundingClientRect().width ?? 0);
    setValueWidth(
      totalDepositValueRef.current?.getBoundingClientRect().width ?? 0
    );
    setContainerWidth(
      containerWidthRef.current?.getBoundingClientRect().width ?? 0
    );
  }, []);

  const combinedWidth = labelWidth + hrWidth;
  const isValueWidth80PercentOrMore = valueWidth >= 0.8 * combinedWidth;

  let isWrapping = false;

  if (isValueWidth80PercentOrMore && containerWidth < 700) {
    isWrapping = true;
  }

  return (
    <div
      className={clsx(styles.summaryStepContainer, className)}
      ref={containerWidthRef}
    >
      <div className={clsx(styles.summaryStepContent)}>
        <div>
          <label className="typography-labels-field-label">Payor</label>
          <p className="typography-content-body-sm">{payorName}</p>
        </div>

        <div>
          <label className="typography-labels-field-label">
            Effective Date
          </label>
          <p className="typography-content-body-sm">
            {dayjs(effectiveDate).format('MM/DD/YYYY')}
          </p>
        </div>

        <div>
          <label className="typography-labels-field-label">
            Payment method
          </label>
          <p className="typography-content-body-sm">
            {bankDetails.branchName.toUpperCase()}
          </p>
          <p className="typography-content-body-sm">
            Checking ending in {accountNumber}
          </p>
        </div>
      </div>

      <hr className={clsx(styles.summaryStepRule)} />

      <div className={clsx(styles.summaryNumbersSection)}>
        <label className="typography-labels-field-label">
          Submitted amount
        </label>
        <hr className={clsx(styles.borderDotted)} />
        <p
          className={clsx(
            'typography-content-body-sm',
            isWrapping ? styles.summaryTotalDeposit : ''
          )}
        >
          {formatUSDollars(submittedAmount)}
        </p>
      </div>

      <div className={clsx(styles.summaryNumbersSection)}>
        <label
          className={clsx(
            styles.summaryTooltip,
            'typography-labels-field-label'
          )}
        >
          Fees
          <Popover
            popoverClassName="typography-labels-field-label"
            title="Fees"
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
              <p>{feesTooltipText}</p>
            </div>
          </Popover>
        </label>
        <hr className={clsx(styles.borderDotted)} />
        <p className="typography-content-body-sm">({formatUSDollars(fees)})</p>
      </div>

      <div className={clsx(styles.summaryNumbersSection)}>
        <label
          ref={totalDepositLabelRef}
          className="typography-labels-field-label"
        >
          Total deposit
        </label>
        <hr ref={totalDepositHrRef} className={clsx(styles.borderDotted)} />
        <p
          ref={totalDepositValueRef}
          className={clsx(
            'typography-content-value',
            isWrapping ? styles.summaryTotalDeposit : ''
          )}
        >
          {formatUSDollars(totalDeposit)}
        </p>
      </div>
    </div>
  );
};
