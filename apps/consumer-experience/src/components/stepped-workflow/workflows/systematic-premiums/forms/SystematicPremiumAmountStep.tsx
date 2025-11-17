'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Frequency } from '@zinnia/api-types/types/bpm';
import {
  AssistiveText,
  AssistiveTextVariant,
  FieldStatus,
  Icon,
  IconType,
  Label,
  Popover,
  Radio,
} from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { FieldDate } from '@/components/field/date/FieldDate';
import { FieldValue } from '@/components/field/value/FieldValue';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';
import { DEFAULT_DATE_FORMAT } from '@/utils/dates';
import { DEFAULT_ERROR_STRING } from '@/utils/strings';

import {
  SPAmountStepSchema,
  systematicPremiumAmountStepSchema,
  SystematicPremiumsAction,
} from '../provider/types';
import { useSystematicPremiums } from '../provider/useSystematicPremiums';
import { default as styles } from '../SystematicPremiums.module.css';
import { paymentFrequencyDisplay } from '../utils';

const PREMIUM_PAYMENT_AMOUNT = 'Premium payment';

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
    defaultValues: {
      ...state.systematicPremiumAmountStep,
      paymentAmount:
        state?.systematicPremiumAmountStep?.paymentAmount || undefined,
    },
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
      <div className="field-container">
        <Controller
          control={form.control}
          name="paymentAmount"
          rules={{
            required: 'Please enter a valid payment amount',
            min: {
              value: 1,
              message: 'Please enter an amount greater than zero',
            },
          }}
          render={({ field }) => (
            <FieldValue
              {...field}
              fieldStatus={
                form.formState.errors.paymentAmount
                  ? FieldStatus.ERROR
                  : FieldStatus.DEFAULT
              }
              errorMessage={form.formState.errors.paymentAmount?.message}
              label={
                <Label
                  interactiveElements={[
                    <Popover
                      key={PREMIUM_PAYMENT_AMOUNT}
                      title={PREMIUM_PAYMENT_AMOUNT}
                      trigger={
                        <Icon
                          type={IconType.CIRCLE_INFO}
                          color="var(--color-base-icon-icon-tooltip, #ff7500)"
                          small
                        />
                      }
                    >
                      <p>
                        Enter the amount you would like to pay into your policy.
                        Keep in mind there are limits (set by federal laws) to
                        the amount you can pay without impacting your coverage
                        or losing tax advantages.
                      </p>
                    </Popover>,
                  ]}
                >
                  {PREMIUM_PAYMENT_AMOUNT}
                </Label>
              }
              placeholder=""
              name="paymentAmount"
              inputMode="numeric"
            />
          )}
        />
      </div>

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
