'use client';
import { PaymentForm } from '@xd/api-types/dist/generated-types/bpm';
import {
  Button,
  Icon,
  IconType,
  Label,
  Loader,
} from '@zinnia/bloom/components';
import { toSentenceCase } from '@zinnia/utils';
import { useParams, useRouter } from 'next/navigation';
import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';

import { FieldData } from '@/components/field-data/FieldData';
import { LabelPopover } from '@/components/label-popover/LabelPopover';
import styles from '@/components/one-time-premium-payment/OneTimePremiumPayment.module.css';
import { PaymentSummaryStep } from '@/components/payment-summary-step/PaymentSummaryStep';
import { AccountNumber } from '@/components/pii/AccountNumber';
import { Address } from '@/components/pii/Address';
import { BankName } from '@/components/pii/BankName';
import { Payee } from '@/components/pii/Payee';
import { useWithdrawals } from '@/components/providers/withdrawals/useWithdrawals';

import { stepsInfo } from '../steps';
import { WithdrawalSteps } from '../types';
import { getNextUrl } from '../utils';

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

export const SummaryPage = () => {
  const { pending } = useFormStatus();
  const router = useRouter();
  const { state } = useWithdrawals();
  const federalTaxAmount = useMemo(() => {
    const taxType = state.taxWithholdingsStep.federal.type;
    const taxAmount = state.taxWithholdingsStep.federal.amount;

    let amount = state.withdrawalAmountStep.paymentAmount ?? 0;

    if (taxType === 'percentage') {
      amount = amount * (Number(taxAmount) / 100);
      return amount;
    }
    if (taxType === 'dollar') {
      return Number(taxAmount);
    }
    if (taxType === 'minimum') {
      // Assuming minimum is a fixed amount, you can replace this with the actual minimum value
      return 10; // Replace with actual minimum value if needed
    }
    return 0; // If 'none', no tax is withheld
  }, [
    state.taxWithholdingsStep.federal,
    state.withdrawalAmountStep.paymentAmount,
  ]);

  const form = useForm();

  const stateTaxAmount = useMemo(() => {
    const taxType = state.taxWithholdingsStep.state.type;
    const taxAmount = state.taxWithholdingsStep.state.amount;

    let amount = state.withdrawalAmountStep.paymentAmount ?? 0;

    if (taxType === 'percentage') {
      amount = amount * (Number(taxAmount) / 100);
      return amount;
    }
    if (taxType === 'dollar') {
      return Number(taxAmount);
    }
    if (taxType === 'minimum') {
      // Assuming minimum is a fixed amount, you can replace this with the actual minimum value
      return 10; // Replace with actual minimum value if needed
    }
    return 0; // If 'none', no tax is withheld
  }, [
    state.taxWithholdingsStep.state,
    state.withdrawalAmountStep.paymentAmount,
  ]);
  const { planCode, policyNumber } = useParams<{
    planCode: string;
    policyNumber: string;
  }>();

  const nextUrl = getNextUrl({
    step: WithdrawalSteps.SUMMARY,
    planCode,
    policyNumber,
  });
  const onSubmit = () => {
    router.push(nextUrl);
  };

  const totalAmount =
    state.withdrawalAmountStep.paymentAmount ??
    0 - federalTaxAmount - stateTaxAmount;

  const calculateFeeAmount = 10;

  const handleEdit = (step: WithdrawalSteps) => {
    const url = stepsInfo[step].url;
    router.push(url);
  };

  const fundWithdrawalMethodCopyMap = {
    prorata: 'Even distribution (prorata)',
    other: 'Other',
  };
  const fundWithdrawalMethod = state.withdrawalMethodStep.withdrawalMethod;
  const fundWithdrawalMethodText =
    fundWithdrawalMethodCopyMap[fundWithdrawalMethod];
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
      label: (
        <Label
          interactiveElements={[
            <LabelPopover key="TEXT" title="Fees">
              <p>
                Premium payment fees are charged to cover costs related to sales
                expenses and/or taxes. If your policy requires these fees, they
                will be shown here.
              </p>
            </LabelPopover>,
          ]}
        >
          Amount Sent to payee
        </Label>
      ),
      value: state.withdrawalAmountStep.paymentAmount,
    },
  ];

  if (calculateFeeAmount > 0) {
    paymentSummaryStepDetails.push({
      label: (
        <Label
          interactiveElements={[
            <LabelPopover key="TEXT" title="Fees">
              <p>
                Premium payment fees are charged to cover costs related to sales
                expenses and/or taxes. If your policy requires these fees, they
                will be shown here.
              </p>
            </LabelPopover>,
          ]}
        >
          Withdrawal Charge
        </Label>
      ),
      value: calculateFeeAmount,
    });
  }

  paymentSummaryStepDetails.push(
    {
      label: (
        <Label
          interactiveElements={[
            <LabelPopover key="TEXT" title="Estimated charges">
              <p>
                Additional charges may accrue if your policy went into pending
                lapse. These charges are estimated here because they are
                calculated daily.
              </p>
            </LabelPopover>,
          ]}
        >
          Federal tax
        </Label>
      ),
      value: federalTaxAmount,
    },
    {
      label: (
        <Label
          interactiveElements={[
            <LabelPopover key="TEXT" title="Estimated charges">
              <p>
                Additional charges may accrue if your policy went into pending
                lapse. These charges are estimated here because they are
                calculated daily.
              </p>
            </LabelPopover>,
          ]}
        >
          State tax (NY)
        </Label>
      ),
      value: stateTaxAmount,
    }
  );

  const distributionMethod = state.distributionMethodStep.distributionType;
  return (
    <form
      id="submit-form"
      style={
        {
          '--field-container-gap': 'var(--measure-dimension-gap-sm)',
        } as CSSProperties
      }
      onSubmit={form.handleSubmit(onSubmit)}
      className={styles.paymentSummaryContainer}
    >
      <div className={styles.paymentSummaryDetails}>
        <FieldData Label={<Label>Withdrawal date</Label>}>
          {state.withdrawalAmountStep.effectiveDate}
        </FieldData>
        <FieldData
          Label={
            <Label
              interactiveElements={[
                <Button
                  onClick={() => handleEdit(WithdrawalSteps.AMOUNT)}
                  mode="link"
                  key="withdrawal-type"
                  size="small"
                >
                  <Icon small type={IconType.EDIT_ALT} />
                </Button>,
              ]}
            >
              Withdrawal type
            </Label>
          }
        >
          {toSentenceCase(state.withdrawalAmountStep.withdrawalType)}
        </FieldData>
        <FieldData
          Label={
            <Label
              interactiveElements={[
                <Button
                  size="small"
                  mode="link"
                  key="withdrawal-method"
                  onClick={() => handleEdit(WithdrawalSteps.METHOD)}
                >
                  <Icon small type={IconType.EDIT_ALT} />
                </Button>,
              ]}
            >
              Fund Withdrawal Method
            </Label>
          }
        >
          {fundWithdrawalMethodText}
        </FieldData>
        <FieldData
          Label={
            <Label
              interactiveElements={[
                <Button
                  size="small"
                  mode="link"
                  key="payee"
                  onClick={() => handleEdit(WithdrawalSteps.PAYEE)}
                >
                  <Icon small type={IconType.EDIT_ALT} />
                </Button>,
              ]}
            >
              Payee
            </Label>
          }
        >
          <Payee payee={state.payeeStep.payeeName} />
        </FieldData>

        <FieldData
          caption={distributionMethod === 'ACH' ? 'Bank' : 'Address'}
          Label={
            <Label
              interactiveElements={[
                <Button
                  size="small"
                  mode="link"
                  key="distribution-method"
                  onClick={() => handleEdit(WithdrawalSteps.DISTRIBUTION)}
                >
                  <Icon small type={IconType.EDIT_ALT} />
                </Button>,
              ]}
            >
              Distribution method
            </Label>
          }
        >
          <>
            {distributionMethod === PaymentForm.ACH && (
              <div className="typography-content-body-sm">
                <div>
                  <BankName
                    bankName={state.distributionMethodStep.bank?.branchName}
                  />
                </div>
                <div>
                  <span className="typography-content-body-sm">ending in</span>{' '}
                  <AccountNumber
                    accountNumber={
                      state.distributionMethodStep.bank?.accountNumber
                    }
                  />
                </div>
              </div>
            )}
            {distributionMethod === PaymentForm.CHECK && (
              <div className="typography-content-body-sm">
                <Address
                  addrLine1={state.distributionMethodStep.address?.addrLine1}
                  city={state.distributionMethodStep.address?.city}
                  state={state.distributionMethodStep.address?.state}
                  zipCode={state.distributionMethodStep.address?.zipCode}
                  addrCountry={
                    state.distributionMethodStep.address?.addrCountry
                  }
                  addrLine2={state.distributionMethodStep.address?.addrLine2}
                  addrLine3={state.distributionMethodStep.address?.addrLine3}
                  zipExt={state.distributionMethodStep.address?.zipExt}
                />
              </div>
            )}
          </>
        </FieldData>
      </div>
      <PaymentSummaryStep
        className={styles.paymentSummaryStepContainer}
        transactionSummary={paymentSummaryStepDetails}
        total={{
          label: (
            <Label
              interactiveElements={[
                <LabelPopover title="Premium payment" key="premium payment">
                  <div>
                    <p>
                      Enter the amount you would like to pay into your policy.
                      Keep in mind there are limits (set by federal laws) to the
                      amount you can pay without impacting your coverage or
                      losing tax advantages.{' '}
                    </p>
                  </div>
                </LabelPopover>,
              ]}
            >
              Total withdrawal
            </Label>
          ),
          deposit: totalAmount,
        }}
      />
    </form>
  );
};
