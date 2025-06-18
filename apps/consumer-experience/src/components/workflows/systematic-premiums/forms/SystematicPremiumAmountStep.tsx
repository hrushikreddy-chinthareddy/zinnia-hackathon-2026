'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { SystematicProgram } from '@xd/api-types/dist/generated-types/sor';
import { DEFAULT_DATE_FORMAT } from '@xd/utils/dist';
import {
  AssistiveText,
  AssistiveTextVariant,
  Label,
  Radio,
} from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { FieldDate } from '@/components/field/date/FieldDate';
import { LabelPopover } from '@/components/label-popover/LabelPopover';
import {
  paymentFrequencyEnum,
  SPAmountStepSchema,
  SPPaymentFrequency,
  systematicPremiumAmountStepSchema,
  SystematicPremiumsAction,
} from '@/components/providers/systematic-premiums/types';
import { useSystematicPremiums } from '@/components/providers/systematic-premiums/useSystematicPremiums';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';
import { formatUSDollars } from '@/utils/currency';

import { default as styles } from '../SystematicPremiums.module.css';
import { PaymentFrequencyMap } from '../utils';

const getRadioValue = (freq: SPPaymentFrequency, premiumAmount: number) => {
  const dollarAmt = premiumAmount / PaymentFrequencyMap[freq].divisor;
  return formatUSDollars(dollarAmt);
};

const getRadioOptions = (premiumAmout: number) => {
  return Object.entries(PaymentFrequencyMap).map(([k, value]) => {
    const key = k as keyof typeof PaymentFrequencyMap;
    const displayLabel = getRadioValue(
      paymentFrequencyEnum.enum[key],
      premiumAmout
    );
    return {
      key,
      value: key,
      label: `${value.label} (${displayLabel})`,
      ariaLabel: `systematic-premium-amount-${key}`,
    };
  });
};

export const SystematicPremiumAmountStep = ({
  systematicPrograms: _systematicPrograms,
}: {
  systematicPrograms: SystematicProgram[];
}) => {
  const { state, dispatch } = useSystematicPremiums();
  const { stepInfo } = useSteppedWorkflowContext();
  const router = useRouter();

  const form = useForm<SPAmountStepSchema>({
    resolver: zodResolver(systematicPremiumAmountStepSchema),
    defaultValues: state.systematicPremiumAmountStep,
  });
  const premiumAmount = state.yearlyPremiumAmount;

  const onSubmit: SubmitHandler<SPAmountStepSchema> = data => {
    dispatch({
      type: SystematicPremiumsAction.SET_SYSTEMATIC_PREMIUM_AMOUNT_STEP,
      payload: {
        systematicPremiumAmountStep: data,
      },
    });

    router.push(stepInfo.nextStepUrl);
  };

  return (
    <form
      className={styles.form}
      id="submit-form"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div
        id="systematic-premium-amt-form"
        style={{
          display: 'flex',
          alignItems: 'center',
          verticalAlign: 'middle',
          gap: 'var(--measure-dimension-gap-sm)',
        }}
      >
        <p className="typography-labels-field-label">Payment frequency</p>
        <LabelPopover title="">{''}</LabelPopover>
      </div>

      <Controller
        control={form.control}
        name="paymentFrequency"
        render={({ field }) => (
          <div>
            <Radio
              onValueChange={v => {
                const freq = v as keyof typeof PaymentFrequencyMap;
                const dollarAmt =
                  premiumAmount / PaymentFrequencyMap[freq].divisor;
                form.setValue('paymentAmount', dollarAmt);
                field.onChange(v);
              }}
              id="systematic-premium-amount"
              defaultValue={form.formState.defaultValues?.paymentFrequency}
              options={getRadioOptions(premiumAmount)}
            />
            {form.formState.errors.paymentFrequency?.message && (
              <AssistiveText
                text={form.formState.errors.paymentFrequency.message}
                variant={AssistiveTextVariant.Error}
              />
            )}
          </div>
        )}
      />
      <div className={styles.field}>
        <Label labelFor="effective-date">Effective Date</Label>
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
    </form>
  );
};
