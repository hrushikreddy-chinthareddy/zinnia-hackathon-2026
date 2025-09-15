'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Frequency } from '@xd/api-types/dist/generated-types/bpm';
import { DEFAULT_DATE_FORMAT, DEFAULT_ERROR_STRING } from '@xd/utils/dist';
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
import {
  SPAmountStepSchema,
  systematicPremiumAmountStepSchema,
  SystematicPremiumsAction,
} from '@/components/providers/systematic-premiums/types';
import { useSystematicPremiums } from '@/components/providers/systematic-premiums/useSystematicPremiums';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';

import { default as styles } from '../SystematicPremiums.module.css';
import { paymentFrequencyDisplay } from '../utils';

const getRadioOptions = () => {
  return Object.keys(Frequency)
    .map(k => {
      const label = paymentFrequencyDisplay(k as Frequency);

      if (label === DEFAULT_ERROR_STRING) {
        return null;
      }

      return {
        key: k,
        value: k,
        label: label,
        ariaLabel: `systematic-premium-amount-${k}`,
      };
    })
    .filter(freq => !!freq);
};

export const SystematicPremiumAmountStep = () => {
  const { state, dispatch } = useSystematicPremiums();
  const { stepInfo } = useSteppedWorkflowContext();
  const router = useRouter();

  const form = useForm<SPAmountStepSchema>({
    resolver: zodResolver(systematicPremiumAmountStepSchema),
    defaultValues: state.systematicPremiumAmountStep,
  });

  const onSubmit: SubmitHandler<SPAmountStepSchema> = data => {
    dispatch({
      type: SystematicPremiumsAction.SET_SYSTEMATIC_PREMIUM_AMOUNT_STEP,
      payload: {
        systematicPremiumAmountStep: data,
      },
    });

    router.push(stepInfo.nextStepUrl);
  };

  const radioOptions = getRadioOptions();

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
      </div>

      <Controller
        control={form.control}
        name="paymentFrequency"
        render={({ field }) => (
          <div>
            <Radio
              onValueChange={field.onChange}
              id="systematic-premium-amount"
              defaultValue={form.formState.defaultValues?.paymentFrequency}
              options={radioOptions}
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
        <Label labelFor="next-payment-date">Next payment date</Label>
        <div>
          <Controller
            control={form.control}
            name="nextPaymentDate"
            render={({ field }) => (
              <FieldDate
                name="systematic-next-payment-date"
                disableBeforeDate={dayjs().toDate()}
                id="next-payment-date"
                defaultDate={dayjs(
                  form.formState.defaultValues?.nextPaymentDate
                ).format(DEFAULT_DATE_FORMAT)}
                onDateSelect={date => {
                  const formattedDate = dayjs(date).format(DEFAULT_DATE_FORMAT);
                  field.onChange(formattedDate);
                }}
              />
            )}
          />
          {form.formState.errors.nextPaymentDate?.message && (
            <AssistiveText
              text={form.formState.errors.nextPaymentDate.message}
              variant={AssistiveTextVariant.Error}
            />
          )}
        </div>
      </div>
    </form>
  );
};
