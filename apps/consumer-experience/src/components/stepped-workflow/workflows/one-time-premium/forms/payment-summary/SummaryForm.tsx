'use client';
import { Label, LabelProps, Loader } from '@zinnia/bloom/components';
import { toSentenceCase } from '@zinnia/xd-utils';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { FieldData } from '@/components/field-data/FieldData';
import { LabelPopover } from '@/components/label-popover/LabelPopover';
import { PaymentSummaryStep } from '@/components/payment-summary-step/PaymentSummaryStep';
import { AccountNumber } from '@/components/pii/AccountNumber';
import { AccountType } from '@/components/pii/AccountType';
import { BankName } from '@/components/pii/BankName';
import { Payor } from '@/components/pii/Payor';
import { DEFAULT_DATE_FORMAT } from '@/utils/dates';

import { OttpState } from '../../provider/types';
import styles from '../OneTimePremiumPayment.module.css';

// TODO: UPDATE COPY!!!!
const loadingStrings = [
  'one moment please',
  'We’re working on it...',
  'data is updating',
];

const LoadingText = () => {
  const [loadingText, setLoadingText] = useState(loadingStrings[0]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loadingText === loadingStrings[loadingStrings.length - 1]) {
        setLoadingText(loadingStrings[0]);
      } else {
        setLoadingText(
          loadingText =>
            loadingStrings[
              loadingStrings.indexOf(loadingText || 'one moment please') + 1
            ]
        );
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [loadingText]);

  return (
    <p className="typography-desktop-headline-3-d m-md">
      {toSentenceCase(loadingText)}
    </p>
  );
};

export const SummaryForm = ({
  ottpPaymentData,
  paymentSummaryDetails,
}: {
  ottpPaymentData: OttpState;
  paymentSummaryDetails: {
    label: React.ReactElement<LabelProps>;
    value?: number;
  }[];
}) => {
  const { effectiveDate, paymentAmount, payorBank } = ottpPaymentData;
  const { pending } = useFormStatus();

  if (pending) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        className="p-3xl"
      >
        <Loader />
        <LoadingText />
      </div>
    );
  }

  return (
    <>
      <div className={styles.paymentSummaryContainer}>
        <div className={styles.paymentSummaryDetails}>
          <FieldData Label={<Label>Payor</Label>}>
            <Payor
              className="typography-content-body-sm"
              payor={payorBank.nameOnAccount}
            />
          </FieldData>
          <FieldData Label={<Label>Effective date</Label>}>
            <span className="typography-content-body-sm">
              {dayjs(effectiveDate).format(DEFAULT_DATE_FORMAT)}
            </span>
          </FieldData>
          <FieldData Label={<Label>Payment method</Label>}>
            <div className="typography-content-body-sm">
              <div>
                <BankName
                  bankName={payorBank.branchName}
                  accountType={payorBank.accountType}
                />
              </div>
              <div>
                <AccountType accountType={payorBank.accountType} />{' '}
                <span className="typography-content-body-sm">ending in</span>{' '}
                <AccountNumber accountNumber={payorBank.accountNumber} />
              </div>
            </div>
          </FieldData>
        </div>
        <PaymentSummaryStep
          className={styles.paymentSummaryStepContainer}
          transactionSummary={paymentSummaryDetails}
          total={{
            label: (
              <Label
                interactiveElements={[
                  <LabelPopover title="Premium payment" key="premium payment">
                    <div>
                      <p>
                        Enter the amount you would like to pay into your policy.
                        Keep in mind there are limits (set by federal laws) to
                        the amount you can pay without impacting your coverage
                        or losing tax advantages.{' '}
                      </p>
                      {/* <p>
        Currently, you may pay up to [MEC limit value, CVAT value,
        Guideline premium value, whichever is the lesser of] without
        changing the nature of your policy or it's tax advantages.
        If you'd like to pay more than this, we suggest speaking
        with a financial professional (like a tax advisor) who can
        help walk you through the consequences first.
      </p> */}
                    </div>
                  </LabelPopover>,
                ]}
              >
                Premium payment
              </Label>
            ),
            deposit: paymentAmount.plain,
          }}
        />
      </div>
    </>
  );
};
