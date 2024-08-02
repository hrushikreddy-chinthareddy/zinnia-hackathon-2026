'use client';
import {
  Button,
  Icon,
  IconType,
  Label,
  Link,
  Loader,
  Popover,
} from '@zinnia/bloom/components';
import { toSentenceCase } from '@zinnia/utils';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { submitOneTimePaymentAction } from '@/actions/bpm-actions-too';

import styles from './OneTimePremiumPayment.module.css';
import { oneTimePremiumSteps } from './steps';
import { FieldData } from '../field-data/FieldData';
import { HeaderLink } from '../header-link/HeaderLink';
import { PaymentSummaryStep } from '../payment-summary-step/PaymentSummaryStep';
import { AccountNumber } from '../pii/AccountNumber';
import { AccountType } from '../pii/AccountType';
import { BankName } from '../pii/BankName';
import { ProgressBarSteps } from '../progress-bar-steps/ProgressBarSteps';
import { useOttp } from '../providers/one-time-premium-payment/OttpContext';
import { OttpState } from '../providers/one-time-premium-payment/types';
import { CancelDialogLink } from '../transactions/CancelDialogLink';

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

export interface OTTPPaymentDetails {
  effectiveDate: string;
  paymentAmount: number;
  payorBank: string;
}

const Summary = ({
  ottpPaymentData,
  planCode,
  policyNumber,
}: {
  ottpPaymentData: OttpState;
  planCode: string;
  policyNumber: string;
}) => {
  const { effectiveDate, paymentAmount, payorBank, paymentFee } =
    ottpPaymentData;
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
      <HeaderLink
        className="mb-xl"
        title={oneTimePremiumSteps.summary.title}
        link={{
          // TODO: use an object or something instead of hard coding
          url: `/policies/${planCode}/${policyNumber}/premium-payment/select-bank`,
          label: 'return to select bank',
        }}
      />
      <ProgressBarSteps
        totalSteps={Object.keys(oneTimePremiumSteps).length}
        currentStep={
          Object.keys(oneTimePremiumSteps).findIndex(
            step => step === 'summary'
          ) + 1
        }
        className="steps-progress-bar mb-xl"
      />
      <div className={styles.paymentSummaryContainer}>
        <div className={styles.paymentSummaryDetails}>
          <FieldData Label={<Label>Payor</Label>}>
            <span className="typography-content-body-sm">
              {payorBank.nameOnAccount}
            </span>
          </FieldData>
          <FieldData Label={<Label>Effective date</Label>}>
            <span className="typography-content-body-sm">{effectiveDate}</span>
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
          transactionSummary={[
            {
              label: <Label>Submitted Amount</Label>,
              value: paymentAmount,
            },
            {
              label: (
                <Label
                  interactiveElements={[
                    <Popover
                      key="TEXT"
                      title="Fees"
                      trigger={
                        <Icon
                          type={IconType.CIRCLE_INFO}
                          color="var(--color-base-icon-icon-tooltip, #ff7500)"
                          width={16}
                          height={16}
                        />
                      }
                    >
                      <p>
                        Premium payment fees are charged to cover costs related
                        to sales expenses and/or taxes. If your policy requires
                        these fees, they will be shown here.{' '}
                      </p>
                    </Popover>,
                  ]}
                >
                  Fees
                </Label>
              ),
              // TODO: get value from API
              value: paymentFee && paymentFee * -1,
            },
          ]}
          total={{
            label: <Label>Total deposit</Label>,
            deposit:
              paymentFee && paymentAmount
                ? paymentAmount * paymentFee
                : paymentAmount || 0,
          }}
        />
      </div>
      <div className={styles.buttonGroup}>
        <Button mode="primary" type="submit">
          Submit payment
        </Button>
        <CancelDialogLink planCode={planCode} policyNumber={policyNumber} />
      </div>
    </>
  );
};

export const PaymentSummary = ({
  planCode,
  policyNumber,
}: {
  moveToNextStep?: () => void;
  planCode: string;
  policyNumber: string;
}) => {
  const router = useRouter();
  const { state } = useOttp();
  const [error, setError] = useState<string>();

  const handleFormSubmit = async () => {
    const response = await submitOneTimePaymentAction({
      planCode,
      policyNumber,
      paymentDetails: state,
    });

    // TODO: use form setStateAction here rather than useState???
    if (response?.data) {
      router.push(
        `/policies/${planCode}/${policyNumber}/premium-payment/submitted`
      );
    } else {
      setError(response?.error?.message);
    }
  };

  if (error) {
    return (
      <div style={{ textAlign: 'center' }} className="p-3xl">
        <p className="typography-desktop-headline-3-d">
          Sorry, that didn't work
        </p>
        <p className="typography-content-body">
          Services are down, so we couldn’t submit your payment. Please try
          again later.
        </p>
        <div className="flex-center">
          <Link variant="button" href="#" text="Close" />
        </div>
      </div>
    );
  }

  return (
    <form action={handleFormSubmit}>
      <Summary
        ottpPaymentData={state}
        planCode={planCode}
        policyNumber={policyNumber}
      />
    </form>
  );
};
