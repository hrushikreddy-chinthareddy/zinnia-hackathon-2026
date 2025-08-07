'use client';
import { DisbursementPaymentForm } from '@xd/api-types/dist/generated-types/bpm';
import { Button, Icon, IconType, Label } from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { CSSProperties, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FieldData } from '@/components/field-data/FieldData';
import { PaymentSummaryStep } from '@/components/payment-summary-step/PaymentSummaryStep';
import { AccountNumber } from '@/components/pii/AccountNumber';
import { Address } from '@/components/pii/Address';
import { BankName } from '@/components/pii/BankName';
import { Payee } from '@/components/pii/Payee';
import {
  taxWithHoldingSchema,
  SurrenderSteps,
} from '@/components/providers/surrender/types';
import { useSurrender } from '@/components/providers/surrender/useSurrender';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';
import { stepsInfo } from '@/components/workflows/surrender/steps';

import styles from '../Surrender.module.css';

const getTotalTaxAmount = ({
  amountType,
  paymentAmount = 0,
  percentageAmount = 0,
  dollarAmount = 0,
}: {
  amountType: z.infer<typeof taxWithHoldingSchema>['amountType'];
  selectedPercentage?: number;
  paymentAmount?: number;
  percentageAmount?: number;
  dollarAmount?: number;
}) => {
  let amount = 0;
  if (amountType === 'percentage') {
    amount = paymentAmount * (percentageAmount / 100);
  }
  if (amountType === 'dollar') {
    amount = dollarAmount;
  }
  if (amountType === 'none') {
    amount = 0;
  }
  return amount;
};

export const SummaryPage = () => {
  const router = useRouter();
  const { state } = useSurrender();
  const form = useForm();
  const { stepInfo } = useSteppedWorkflowContext();
  const totalFederalAmount = useMemo(
    () =>
      getTotalTaxAmount({
        amountType: state.taxWithholdingsStep.federal.amountType,
        paymentAmount: state.dateStep.netSurrenderValue,
        percentageAmount: Number(state.taxWithholdingsStep.federal.percentage),
        dollarAmount: Number(state.taxWithholdingsStep.federal.dollar),
      }),
    [state.taxWithholdingsStep.federal, state.dateStep.netSurrenderValue]
  );

  const totalStateAmount = useMemo(
    () =>
      getTotalTaxAmount({
        amountType: state.taxWithholdingsStep.state.amountType,
        paymentAmount: state.dateStep.netSurrenderValue,
        percentageAmount: Number(state.taxWithholdingsStep.state.percentage),
        dollarAmount: Number(state.taxWithholdingsStep.state.dollar),
      }),
    [state.taxWithholdingsStep.state, state.dateStep.netSurrenderValue]
  );

  const onSubmit = () => {
    router.push(stepInfo.nextStepUrl);
  };

  const calculateFeeAmount = 10;

  const totalAmount =
    (state.dateStep.netSurrenderValue ?? 0) -
    totalFederalAmount -
    totalStateAmount -
    calculateFeeAmount;

  const handleEdit = (step: SurrenderSteps) => {
    const url = stepsInfo[step].url;
    router.push(url);
  };

  const distributionMethod = state.distributionMethodStep.distributionType;

  return (
    <>
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
          <FieldData Label={<Label>Surrender date</Label>}>
            {state.dateStep.surrenderDate}
          </FieldData>
          <FieldData
            Label={
              <Label
                interactiveElements={[
                  <Button
                    size="small"
                    mode="link"
                    key="payee"
                    onClick={() => handleEdit(SurrenderSteps.PAYEE)}
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
            Label={
              <Label
                interactiveElements={[
                  <Button
                    size="small"
                    mode="link"
                    key="distribution-method"
                    onClick={() => handleEdit(SurrenderSteps.BANK)}
                  >
                    <Icon small type={IconType.EDIT_ALT} />
                  </Button>,
                ]}
              >
                Distribution method
              </Label>
            }
          >
            <div className="typography-content-body-sm">
              {distributionMethod === DisbursementPaymentForm.ACH && (
                <>
                  <div>
                    <BankName
                      bankName={state.distributionMethodStep.bank?.branchName}
                    />
                  </div>
                  <div>
                    <span className="typography-content-body-sm">
                      ending in
                    </span>{' '}
                    <AccountNumber
                      accountNumber={
                        state.distributionMethodStep.bank?.accountNumber
                      }
                    />
                  </div>
                </>
              )}
              {distributionMethod === DisbursementPaymentForm.CHECK && (
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
              )}
            </div>
          </FieldData>
        </div>
        <PaymentSummaryStep
          className={styles.paymentSummaryStepContainer}
          transactionSummary={[
            {
              label: <Label>Net surrender value</Label>,
              value: state.dateStep.netSurrenderValue,
            },
            {
              label: <Label>Surrender charge</Label>,
              value: calculateFeeAmount,
            },
            {
              label: <Label>Federal tax</Label>,
              value: totalFederalAmount,
            },
            {
              label: (
                <Label>
                  State tax ({state.distributionMethodStep.address?.state})
                </Label>
              ),
              value: totalStateAmount,
            },
          ]}
          total={{
            label: <Label>Amount Sent to payee</Label>,
            deposit: totalAmount,
          }}
        />
      </form>
    </>
  );
};
