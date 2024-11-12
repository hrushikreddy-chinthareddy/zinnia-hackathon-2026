'use client';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { Button, Label, Loader } from '@zinnia/bloom/components';
import { toSentenceCase } from '@zinnia/utils';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { LabelPopover } from '@/components/label-popover/LabelPopover';
import { DEFAULT_DATE_FORMAT } from '@/utils/dates';

import { FieldData } from '../../field-data/FieldData';
import { PaymentSummaryStep } from '../../payment-summary-step/PaymentSummaryStep';
import { AccountNumber } from '../../pii/AccountNumber';
import { AccountType } from '../../pii/AccountType';
import { BankName } from '../../pii/BankName';
import { OttpState } from '../../providers/one-time-premium-payment/types';
import { CancelDialogLink } from '../CancelDialogLink';
import { FormHeader } from '../FormHeader';
import styles from '../OneTimePremiumPayment.module.css';
import { Steps } from '../steps';

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
  planCode,
  policyNumber,
  lineOfBusiness,
}: {
  ottpPaymentData: OttpState;
  planCode: string;
  policyNumber: string;
  lineOfBusiness: LineOfBusiness;
}) => {
  const { effectiveDate, paymentAmount, payorBank, paymentFee } =
    ottpPaymentData;
  const { pending } = useFormStatus();
  const calculateFeeAmount = useMemo(() => {
    if (!paymentFee) {
      return 0;
    }
    return (paymentFee / 100) * paymentAmount.plain;
  }, [paymentAmount.plain, paymentFee]);

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

  const paymentSummaryStepDetails = [
    {
      label: <Label>Submitted Amount</Label>,
      value: paymentAmount.plain,
    },
  ];

  if (calculateFeeAmount > 0) {
    paymentSummaryStepDetails.push({
      label: (
        <Label
          interactiveElements={[
            <LabelPopover key="TEXT" title="Charges">
              <p>
                Premium payment fees are charged to cover costs related to sales
                expenses and/or taxes. If your policy requires these fees, they
                will be shown here.
              </p>
            </LabelPopover>,
          ]}
        >
          Charges
        </Label>
      ),
      value: calculateFeeAmount * -1,
    });
  }

  return (
    <>
      <FormHeader
        currentStep={Steps.SUMMARY}
        planCode={planCode}
        policyNumber={policyNumber}
      />
      <div className={styles.paymentSummaryContainer}>
        <div className={styles.paymentSummaryDetails}>
          <FieldData Label={<Label>Payor</Label>}>
            <span className="typography-content-body-sm">
              {payorBank.nameOnAccount}
            </span>
          </FieldData>
          <FieldData Label={<Label>Effective date</Label>}>
            <span className="typography-content-body-sm">
              {dayjs(effectiveDate).format(DEFAULT_DATE_FORMAT)}
            </span>
          </FieldData>
          <FieldData Label={<Label>Payment method</Label>}>
            <div className="typography-content-body-sm">
              <div>
                <BankName bankName={payorBank.branchName} />
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
          transactionSummary={paymentSummaryStepDetails}
          total={{
            label: <Label>Total deposit</Label>,
            deposit: paymentAmount.withFees,
          }}
        />
      </div>
      <div className={styles.buttonGroup}>
        <Button mode="primary" type="submit">
          Submit payment
        </Button>
        <CancelDialogLink
          planCode={planCode}
          policyNumber={policyNumber}
          lineOfBusiness={lineOfBusiness}
        />
      </div>
    </>
  );
};
