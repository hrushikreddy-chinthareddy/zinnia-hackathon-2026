'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { AmountType, DisbursementType } from '@zinnia/api-types/types/bpm';
import {
  AssistiveText,
  AssistiveTextVariant,
  FieldData,
  FieldSize,
  FieldTypes,
  Label,
  Radio,
} from '@zinnia/bloom/components';
import { DEFAULT_DATE_FORMAT } from '@zinnia/utils';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { FieldDate } from '@/components/field/date/FieldDate';
import { LabelPopover } from '@/components/label-popover/LabelPopover';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';

import {
  amountTypeEnum,
  withdrawalAmountStepSchema,
  WithdrawalsAction,
} from '../provider/types';
import { useWithdrawals } from '../provider/useWithdrawals';
import { default as styles } from '../Withdrawals.module.css';

export const WithdrawalAmountForm = () => {
  const { state, dispatch } = useWithdrawals();
  const { stepInfo } = useSteppedWorkflowContext();
  const router = useRouter();
  const maxAmount = 12500;
  const minAmount = 7200;

  const form = useForm<z.infer<typeof withdrawalAmountStepSchema>>({
    resolver: zodResolver(withdrawalAmountStepSchema),
    defaultValues: {
      amountType: state.withdrawalAmountStep?.amountType || AmountType.MAX,
      paymentAmount: maxAmount,
      withdrawalType:
        state.withdrawalAmountStep?.withdrawalType || DisbursementType.GROSS,
      effectiveDate:
        state.withdrawalAmountStep?.effectiveDate ||
        dayjs().format(DEFAULT_DATE_FORMAT),
    },
  });

  const amountType = form.watch('amountType');

  const onSubmit: SubmitHandler<
    z.infer<typeof withdrawalAmountStepSchema>
  > = data => {
    if (data.amountType === AmountType.MAX) {
      data.paymentAmount = maxAmount;
    }

    if (data.amountType === AmountType.WITHDRAWALUNTILBASIS) {
      data.paymentAmount = minAmount;
    }
    dispatch({
      type: WithdrawalsAction.SET_WITHDRAWAL_AMOUNT_STEP,
      payload: {
        withdrawalAmountStep: data,
      },
    });

    router.push(stepInfo.nextStepUrl);
  };
  // setPrimaryButtonDisabled(
  //   !form.formState.isValid || form.formState.isSubmitting
  // );

  return (
    <form
      className={styles.form}
      id="submit-form"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div
        id="withdrawal-amt-form"
        style={{
          display: 'flex',
          alignItems: 'center',
          verticalAlign: 'middle',
          gap: 'var(--measure-dimension-gap-sm)',
        }}
      >
        <p className="typography-labels-field-label">
          How much do you want to withdraw?
        </p>
        <LabelPopover title="ieiejeij">stuff</LabelPopover>
      </div>

      <Controller
        control={form.control}
        name="amountType"
        render={({ field }) => (
          <div>
            <Radio
              onValueChange={v => {
                const amountTypeAmountMap = {
                  [AmountType.MAX]: 12500,
                  [AmountType.WITHDRAWALUNTILBASIS]: 7200,
                  [AmountType.AMOUNT]: undefined,
                };

                if (amountTypeEnum.parse(v)) {
                  const newAmount =
                    amountTypeAmountMap[
                      v as z.input<
                        typeof withdrawalAmountStepSchema
                      >['amountType']
                    ];

                  if (newAmount !== undefined) {
                    form.setValue('paymentAmount', newAmount);
                  }
                }

                field.onChange(v);
              }}
              id="withdrawal-amount"
              defaultValue={form.formState.defaultValues?.amountType}
              options={[
                {
                  key: amountTypeEnum.enum.MAX,
                  value: amountTypeEnum.enum.MAX,
                  label: `Maximum (${12500})`,
                  ariaLabel: 'withdrawal-amount-max',
                },
                {
                  key: amountTypeEnum.enum.WITHDRAWALUNTILBASIS,
                  value: amountTypeEnum.enum.WITHDRAWALUNTILBASIS,
                  label: `Minimum (${7200})`,
                  ariaLabel: 'withdrawal-amount-min',
                },
                {
                  key: amountTypeEnum.enum.AMOUNT,
                  value: amountTypeEnum.enum.AMOUNT,
                  label: 'Other',
                  ariaLabel: 'withdrawal-amount-other',
                },
              ]}
            />
          </div>
        )}
      />
      <div>
        <FieldData
          // TODO: XG: fix readonly display in bloooom
          id="payment-amt"
          {...form.register('paymentAmount')}
          readOnly={amountType !== AmountType.AMOUNT}
          label={
            <Label
              labelFor="payment-amt"
              interactiveElements={[
                <LabelPopover key="req-amt" title="requested-amount">
                  stuff
                </LabelPopover>,
              ]}
            >
              Requested Amount
            </Label>
          }
          className={styles.field}
          fieldSize={FieldSize.Small}
          fieldType={FieldTypes.Value}
        />
        {form.formState.errors.paymentAmount?.message && (
          <AssistiveText
            text={form.formState.errors.paymentAmount.message}
            variant={AssistiveTextVariant.Error}
          />
        )}
      </div>
      <div className={styles.field}>
        <Label labelFor="effective-date">Withdrawal date</Label>
        <div>
          <Controller
            control={form.control}
            name="effectiveDate"
            render={({ field }) => (
              <FieldDate
                {...field}
                disableBeforeDate={dayjs().subtract(1, 'day').toDate()}
                id="effective-date"
                defaultDate={form.formState.defaultValues?.effectiveDate}
                onDateSelect={date => {
                  const formattedDate = dayjs(date).format(DEFAULT_DATE_FORMAT);
                  field.onChange(formattedDate);
                }}
              />
            )}
          />
          {form.formState.errors.effectiveDate?.message && (
            <AssistiveText
              text={form.formState.errors.effectiveDate.message}
              variant={AssistiveTextVariant.Error}
            />
          )}
        </div>
      </div>
      <div
        id="pmt-tpe"
        role="radiogroup"
        aria-label="select payment method"
        className={styles.radio}
      >
        <label htmlFor={DisbursementType.GROSS} className={clsx(styles.card)}>
          <div className="typography-labels-label-lg">Gross</div>
          <div
            className={clsx(styles.bankDetail, 'typography-content-caption')}
          >
            Taxes and any applicable fees are deducted from the amount you
            request, meaning you'll receive a lower payout, but no extra money
            will be taken from your account.
          </div>

          <input
            style={{ position: 'absolute', opacity: 0 }}
            type="radio"
            role="radio"
            id={DisbursementType.GROSS}
            value={DisbursementType.GROSS}
            {...form.register('withdrawalType')}
          />
        </label>

        <label htmlFor={DisbursementType.NET} className={clsx(styles.card)}>
          <div className="typography-labels-label-lg">Net</div>
          <div className={`${styles.bankDetail} typography-content-caption`}>
            You’ll receive the full amount you request, and any taxes or fees
            will be taken separately from your account balance.
          </div>

          <input
            style={{ position: 'absolute', opacity: 0 }}
            type="radio"
            role="radio"
            id={DisbursementType.NET}
            value={DisbursementType.NET}
            {...form.register('withdrawalType')}
          />
        </label>
      </div>
    </form>
  );
};
