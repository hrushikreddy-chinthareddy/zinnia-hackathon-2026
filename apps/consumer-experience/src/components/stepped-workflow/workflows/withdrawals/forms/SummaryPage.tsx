'use client';
import { useQuery } from '@tanstack/react-query';
import {
  AllocationOption,
  DisbursementPaymentForm,
  TransactionFailureResponse,
} from '@zinnia/api-types/types/bpm';
import {
  AssistiveText,
  AssistiveTextVariant,
  Button,
  Icon,
  IconType,
  Label,
} from '@zinnia/bloom/components';
import { toSentenceCase } from '@zinnia/xd-utils';
import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FieldData } from '@/components/field-data/FieldData';
import { LabelPopover } from '@/components/label-popover/LabelPopover';
import { PaymentSummaryStep } from '@/components/payment-summary-step/PaymentSummaryStep';
import { AccountNumber } from '@/components/pii/AccountNumber';
import { Address } from '@/components/pii/Address';
import { BankName } from '@/components/pii/BankName';
import { Payee } from '@/components/pii/Payee';
import { PaymentLoading } from '@/components/stepped-workflow/common/TransactionLoading';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';
import { getPartialWithdrawalOneTimeValidation } from '@/queries/transaction-queries';

// TODO: eventually move this into common styles, this is using a style from
// surrender that is used in multiple files
import styles from '../../surrender/Surrender.module.css';
import { taxWithholdingSchema, WithdrawalSteps } from '../provider/types';
import { useWithdrawals } from '../provider/useWithdrawals';
import { stepsInfo } from '../steps';

const fundWithdrawalMethodCopyMap = {
  [AllocationOption.PRORATA]: 'Even distribution (prorata)',
  [AllocationOption.DEFAULT]: 'Other',
};

const getTotalTaxAmount = ({
  amountType,
  paymentAmount = 0,
  percentageAmount = 0,
  dollarAmount = 0,
}: {
  amountType: z.infer<typeof taxWithholdingSchema>['amountType'];
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
  const { state } = useWithdrawals();
  const form = useForm();
  const { stepInfo, setPrimaryButtonDisabled } = useSteppedWorkflowContext();

  const totalFederalAmount = useMemo(
    () =>
      getTotalTaxAmount({
        amountType: state.taxWithholdingsStep.federal.amountType,
        paymentAmount: state.withdrawalAmountStep.paymentAmount,
        percentageAmount: Number(state.taxWithholdingsStep.federal.percentage),
        dollarAmount: Number(state.taxWithholdingsStep.federal.dollar),
      }),
    [
      state.taxWithholdingsStep.federal,
      state.withdrawalAmountStep.paymentAmount,
    ]
  );

  const totalStateAmount = useMemo(
    () =>
      getTotalTaxAmount({
        amountType: state.taxWithholdingsStep.state.amountType,
        paymentAmount: state.withdrawalAmountStep.paymentAmount,
        percentageAmount: Number(state.taxWithholdingsStep.state.percentage),
        dollarAmount: Number(state.taxWithholdingsStep.state.dollar),
      }),
    [state.taxWithholdingsStep.state, state.withdrawalAmountStep.paymentAmount]
  );

  const { planCode, policyNumber } = useParams<{
    planCode: string;
    policyNumber: string;
  }>();

  const onSubmit = () => {
    router.push(stepInfo.nextStepUrl);
  };

  const calculateFeeAmount = 10;

  const totalAmount =
    (state.withdrawalAmountStep.paymentAmount ?? 0) -
    totalFederalAmount -
    totalStateAmount -
    calculateFeeAmount;

  const handleEdit = (step: WithdrawalSteps) => {
    const url = stepsInfo[step].url;
    router.push(url);
  };

  const fundWithdrawalMethod = state.withdrawalMethodStep.withdrawalMethod;

  const fundWithdrawalMethodText =
    fundWithdrawalMethodCopyMap[fundWithdrawalMethod];

  const {
    data: validationResponse,
    isError: validationError,
    error,
    isSuccess: isValidationSuccess,
    isFetching: isValidationFetching,
  } = useQuery({
    queryKey: ['getPartialWithdrawalOneTimeValidation', state],
    queryFn: () => {
      return getPartialWithdrawalOneTimeValidation({
        planCode,
        policyNumber,
        body: state,
      });
    },
  });

  if (validationError) {
    router.push(`error?correlationId=${error.correlationId}`);
  }

  if (isValidationFetching) {
    setPrimaryButtonDisabled(true);

    return <PaymentLoading />;
  }

  if (isValidationSuccess) {
    setPrimaryButtonDisabled(false);
  }

  if (
    validationResponse?.status === TransactionFailureResponse.status.FAILURE
  ) {
    setPrimaryButtonDisabled(true);
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
      value: totalFederalAmount,
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
          State tax ({state.distributionMethodStep.address?.state})
        </Label>
      ),
      value: totalStateAmount,
    }
  );

  const distributionMethod = state.distributionMethodStep.distributionType;

  return (
    validationResponse && (
      <>
        <form
          id="submit-form"
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
              caption={
                distributionMethod === DisbursementPaymentForm.ACH
                  ? 'Bank'
                  : 'Address'
              }
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
            transactionSummary={paymentSummaryStepDetails}
            total={{
              label: (
                <Label
                  interactiveElements={[
                    <LabelPopover title="Premium payment" key="premium payment">
                      <div>
                        <p>
                          Enter the amount you would like to pay into your
                          policy. Keep in mind there are limits (set by federal
                          laws) to the amount you can pay without impacting your
                          coverage or losing tax advantages.{' '}
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
        {validationResponse?.status ===
          TransactionFailureResponse.status.FAILURE && (
          <div>
            {validationResponse.validationResult?.map(
              (result, index) =>
                result.resolution?.length && (
                  <AssistiveText
                    className="mb-md"
                    key={index}
                    variant={AssistiveTextVariant.Error}
                    text={result.resolution}
                  />
                )
            )}
          </div>
        )}
      </>
    )
  );
};
