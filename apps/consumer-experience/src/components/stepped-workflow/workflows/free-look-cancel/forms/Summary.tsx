'use client';
import { DisbursementPaymentForm } from '@zinnia/api-types/types/bpm';
import {
  BankAccount,
  Address as AddressSOR,
} from '@zinnia/api-types/types/sor';
import { Icon, IconType, Label, Loader } from '@zinnia/bloom/components';
import { toSentenceCase } from '@zinnia/utils';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/components/button/Button';
import { FieldData } from '@/components/field-data/FieldData';
import { Link } from '@/components/link/Link';
import { PaymentSummaryStep } from '@/components/payment-summary-step/PaymentSummaryStep';
import { AccountNumber } from '@/components/pii/AccountNumber';
import { AccountType } from '@/components/pii/AccountType';
import { Address } from '@/components/pii/Address';
import { BankName } from '@/components/pii/BankName';
import { FullName } from '@/components/pii/FullName';
import { CancelDialogLink } from '@/components/stepped-workflow/common/CancelDialogLink';
import styles from '@/components/stepped-workflow/common/Styles.module.css';
import { useGetTransactionStepData } from '@/hooks/use-get-transaction-step-data';
import { DEFAULT_DATE_FORMAT } from '@/utils/dates';
import { DEFAULT_ERROR_STRING } from '@/utils/strings';

import { FreeLookCancelUrlPaths } from '../provider/types';
import { useFreeLookCancel } from '../provider/useFreeLookCancel';
import { stepsInfo } from '../steps';

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

export const Summary = () => {
  const router = useRouter();
  const { pending } = useFormStatus();
  const { state } = useFreeLookCancel();
  const { dateStep, distributionMethodStep, payeeStep } = state;
  const { nextStep } = useGetTransactionStepData({ stepsInfo });
  // TODO: make sure to add correlationId as query param when API is implemented
  // and redirecting to error string, see generateTransactionErrorUrl as example

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

  const distributionMethodDisplay = (accountType: string) => {
    switch (accountType) {
      case DisbursementPaymentForm.ACH:
        return 'Direct deposit (ACH)';
      case DisbursementPaymentForm.CHECK:
        return 'Paper check (mailed to your address)';
      default:
        return DEFAULT_ERROR_STRING;
    }
  };

  const onSubmit = () => {
    router.push(nextStep?.url || '');
  };

  return (
    <>
      <div className={styles.standardSummaryContainer}>
        <div className={styles.standardSummaryDetails}>
          <FieldData
            Label={
              <Label
                interactiveElements={[
                  <Link
                    key="distribution-method"
                    href={stepsInfo[FreeLookCancelUrlPaths.DATE].url}
                    aria-label="Edit cancellation date"
                    isInternal
                  >
                    <Icon small type={IconType.EDIT_ALT} />
                  </Link>,
                ]}
              >
                Cancellation date
              </Label>
            }
          >
            <span className="typography-content-body-sm">
              {dayjs(dateStep?.cancellationDate).format(DEFAULT_DATE_FORMAT)}
            </span>
          </FieldData>
          <FieldData
            Label={
              <Label
                interactiveElements={[
                  <Link
                    key="distribution-method"
                    href={stepsInfo[FreeLookCancelUrlPaths.PAYEE].url}
                    aria-label="Edit cancellation date"
                    isInternal
                  >
                    <Icon small type={IconType.EDIT_ALT} />
                  </Link>,
                ]}
              >
                Payee
              </Label>
            }
          >
            <span className="typography-content-body-sm">
              <FullName
                firstName={payeeStep?.firstName}
                lastName={payeeStep?.lastName}
              />
            </span>
          </FieldData>
          <FieldData
            Label={
              <Label
                interactiveElements={[
                  <Link
                    key="distribution-method"
                    href={stepsInfo[FreeLookCancelUrlPaths.DISTRIBUTION].url}
                    aria-label="Edit cancellation date"
                    isInternal
                  >
                    <Icon small type={IconType.EDIT_ALT} />
                  </Link>,
                ]}
              >
                Distribution method
              </Label>
            }
          >
            <div className="typography-content-body-sm">
              {distributionMethodStep.type === DisbursementPaymentForm.ACH && (
                <div>
                  <p>
                    {distributionMethodDisplay(distributionMethodStep.type)}
                  </p>
                  <p>
                    <BankName
                      bankName={
                        (distributionMethodStep.method as BankAccount)
                          ?.branchName
                      }
                      accountType={
                        (distributionMethodStep.method as BankAccount)
                          ?.accountType
                      }
                    />
                  </p>
                  <p>
                    <AccountType
                      accountType={
                        (distributionMethodStep.method as BankAccount)
                          ?.accountType
                      }
                    />{' '}
                    <span className="typography-content-body-sm">
                      ending in
                    </span>{' '}
                    <AccountNumber
                      accountNumber={
                        (distributionMethodStep.method as BankAccount)
                          ?.accountNumber
                      }
                    />
                  </p>
                </div>
              )}
              {distributionMethodStep.type ===
                DisbursementPaymentForm.CHECK && (
                <div>
                  <p>
                    {distributionMethodDisplay(distributionMethodStep.type)}
                  </p>
                  <Address
                    addrLine1={
                      (distributionMethodStep.method as AddressSOR)
                        ?.addressLine1
                    }
                    addrCountry={
                      (distributionMethodStep.method as AddressSOR)?.country
                    }
                    addrLine2={
                      (distributionMethodStep.method as AddressSOR)
                        ?.addressLine2
                    }
                    addrLine3={
                      (distributionMethodStep.method as AddressSOR)
                        ?.addressLine3
                    }
                    city={(distributionMethodStep.method as AddressSOR)?.city}
                    state={(distributionMethodStep.method as AddressSOR)?.state}
                    zipCode={
                      (distributionMethodStep.method as AddressSOR)?.zipCode
                    }
                  />
                </div>
              )}
            </div>
          </FieldData>
        </div>
        <PaymentSummaryStep
          className={styles.standardSummaryStepContainer}
          total={{
            label: <Label>Amount sent to payee</Label>,
            deposit: dateStep.netSurrenderValue || 0,
          }}
        />
      </div>
      <div className={styles.stepActions}>
        <Button onClick={onSubmit}>Submit cancellation</Button>
        <CancelDialogLink />
      </div>
    </>
  );
};
