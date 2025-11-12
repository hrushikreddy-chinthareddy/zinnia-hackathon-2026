'use client';
import {
  AssistiveText,
  AssistiveTextVariant,
  IconType,
} from '@zinnia/bloom/components';
import { Controller, useFormContext } from 'react-hook-form';

import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import noDataStyles from '@/components/no-data-available/NoDataAvailable.module.css';
import { AccountNumber } from '@/components/pii/AccountNumber';
import { AccountType } from '@/components/pii/AccountType';
import { BankName } from '@/components/pii/BankName';
import { SkeletonLoader } from '@/components/skeleton-loader/SkeletonLoader';
import { PaymentMethod } from '@/types/payment';

import styles from './Selectable.module.css';

interface SelectBankProps {
  activePaymentMethods: PaymentMethod[];
  correlationId?: string;
  defaultSelectedBankId?: string;
}

export const SelectablePaymentMethods = ({
  activePaymentMethods,
  correlationId,
  defaultSelectedBankId,
}: SelectBankProps) => {
  const { control } = useFormContext();

  return (
    <div>
      {activePaymentMethods.length === 0 && (
        <div className={noDataStyles.noBankDetails}>
          <NoDataAvailable
            iconType={IconType.BANK}
            correlationId={correlationId}
          >
            <p className="typography-content-body">
              Looks like you haven't added any banking information yet.
            </p>
          </NoDataAvailable>
        </div>
      )}
      {activePaymentMethods.length > 0 && (
        <div
          role="radiogroup"
          aria-label="select payment method"
          className={styles.radioCardContainer}
        >
          {activePaymentMethods?.map((bankDetail, index) => {
            if (bankDetail.pending) {
              return (
                <SkeletonLoader
                  className={styles.radioCard}
                  key={index}
                  width={'100%'}
                  height={'75px'}
                />
              );
            }
            return (
              <div
                key={`${index}-${bankDetail.branchName}`}
                className={styles.radioCard}
              >
                <Controller
                  // TODO: should this be passed in as a prop?
                  name="paymentMethod"
                  control={control}
                  // TODO: may want to pass this in as a prop at some point
                  // in forms where there is a radio between banks and addresses,
                  // this makes the form unsubmittable
                  // rules={{ required: true }}
                  render={({ field }) => (
                    <label
                      key={`${index}-${bankDetail.branchName}`}
                      className={styles.radioCardInner}
                    >
                      <BankName
                        bankName={bankDetail.branchName}
                        accountType={bankDetail.accountType}
                        className="typography-labels-label-lg"
                      />
                      <div
                        className={`${styles.bankDetail} typography-content-caption`}
                      >
                        <AccountType accountType={bankDetail.accountType} />{' '}
                        <span>
                          {bankDetail.accountType?.includes('Checking') ||
                          bankDetail.accountType?.includes('Savings')
                            ? 'account ending in'
                            : 'ending in'}
                        </span>{' '}
                        <AccountNumber
                          accountNumber={bankDetail.accountNumber}
                        />
                      </div>

                      {bankDetail.autopayEnabled && (
                        <AssistiveText
                          variant={AssistiveTextVariant.Success}
                          text="Premium autopay"
                        />
                      )}
                      <input
                        {...field}
                        style={{ position: 'absolute', opacity: 0 }}
                        type="radio"
                        role="radio"
                        id={`${index}-${bankDetail.bankId}`}
                        value={bankDetail.bankId}
                        defaultChecked={
                          bankDetail?.bankId === defaultSelectedBankId
                        }
                      />
                    </label>
                  )}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
