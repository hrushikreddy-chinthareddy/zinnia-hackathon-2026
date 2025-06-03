'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { DisbursementType } from '@xd/api-types/dist/generated-types/bpm';
import { DEFAULT_DATE_FORMAT } from '@xd/utils/dist';
import {
  AssistiveText,
  AssistiveTextVariant,
  FieldData,
  FieldSize,
  FieldTypes,
  Icon,
  IconType,
  Label,
  Radio,
  Tooltip,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useParams, useRouter } from 'next/navigation';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { FieldDate } from '@/components/field/date/FieldDate';
import { LabelPopover } from '@/components/label-popover/LabelPopover';
import {
  withdrawalAmountStepSchema,
  RadioOptionEnum,
  WithdrawalsAction,
} from '@/components/providers/withdrawals/types';
import { useWithdrawals } from '@/components/providers/withdrawals/useWithdrawals';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';

import { WithdrawalSteps } from '../types';
import { getNextUrl } from '../utils';
import { default as styles } from '../Withdrawals.module.css';

export const WithdrawalAmountForm = () => {
  const { state, dispatch } = useWithdrawals();
  const { setPrimaryButtonDisabled } = useSteppedWorkflowContext();
  const { planCode, policyNumber } = useParams<{
    planCode: string;
    policyNumber: string;
  }>();
  const router = useRouter();
  const maxAmount = 12500;
  const minAmount = 7200;

  const form = useForm<z.infer<typeof withdrawalAmountStepSchema>>({
    resolver: zodResolver(withdrawalAmountStepSchema),
    defaultValues: {
      radioOption: state.withdrawalAmountStep?.radioOption || 'maximum',
      paymentAmount: maxAmount,
      withdrawalType: state.withdrawalAmountStep?.withdrawalType || 'GROSS',
      effectiveDate:
        state.withdrawalAmountStep?.effectiveDate ||
        dayjs().format(DEFAULT_DATE_FORMAT),
    },
  });

  const radioOption = form.watch('radioOption');

  const nextStepInfo = getNextUrl({
    step: WithdrawalSteps.AMOUNT,
    planCode,
    policyNumber,
  });
  const onSubmit: SubmitHandler<
    z.infer<typeof withdrawalAmountStepSchema>
  > = data => {
    if (data.radioOption === 'maximum') {
      data.paymentAmount = maxAmount;
    }

    if (data.radioOption === 'minimum') {
      data.paymentAmount = minAmount;
    }
    dispatch({
      type: WithdrawalsAction.SET_WITHDRAWAL_AMOUNT_STEP,
      payload: data,
    });

    router.push(nextStepInfo);
  };
  setPrimaryButtonDisabled(
    !form.formState.isValid || form.formState.isSubmitting
  );

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
        <Tooltip trigger={<Icon small type={IconType.CIRCLE_INFO} />}>
          stuff
        </Tooltip>
      </div>

      <Controller
        control={form.control}
        name="radioOption"
        render={({ field }) => (
          <div>
            <Radio
              onValueChange={v => {
                const RadioOptionAmountMap = {
                  maximum: 12500,
                  minimum: 7200,
                  other: undefined,
                };

                if (RadioOptionEnum.parse(v)) {
                  const newAmount =
                    RadioOptionAmountMap[
                      v as z.input<
                        typeof withdrawalAmountStepSchema
                      >['radioOption']
                    ];

                  if (newAmount !== undefined) {
                    form.setValue('paymentAmount', newAmount);
                  }
                }

                field.onChange(v);
              }}
              id="withdrawal-amount"
              defaultValue={form.formState.defaultValues?.radioOption}
              options={[
                {
                  key: 'maximum',
                  value: RadioOptionEnum.enum.maximum,
                  label: `Maximum (${12500})`,
                  ariaLabel: 'withdrawal-amount-max',
                },
                {
                  key: 'minimum',
                  value: RadioOptionEnum.enum.minimum,
                  label: `Minimum (${7200})`,
                  ariaLabel: 'withdrawal-amount-min',
                },
                {
                  key: 'other',
                  value: RadioOptionEnum.enum.other,
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
          readOnly={radioOption !== 'other'}
          label={
            <Label
              labelFor="payment-amt"
              interactiveElements={[
                <LabelPopover
                  key="req-amt"
                  title='requested-amount'
                >
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
                disableBeforeDate={dayjs().toDate()}
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
        <label htmlFor="gross" className={clsx(styles.card)}>
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

        <label htmlFor="net" className={clsx(styles.card)}>
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
