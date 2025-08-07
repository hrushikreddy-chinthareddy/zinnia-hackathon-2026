'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AssistiveText,
  AssistiveTextVariant,
  Label,
} from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import z from 'zod';

import { FieldDate } from '@/components/field/date/FieldDate';
import {
  dateStepSchema,
  SurrenderAction,
} from '@/components/providers/surrender/types';
import { useSurrender } from '@/components/providers/surrender/useSurrender';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';
import { formatUSDollars } from '@/utils/currency';
import { ZAHARA_DATE_FORMAT } from '@/utils/dates';

import { default as styles } from '../Surrender.module.css';

export const Date = () => {
  const { state, dispatch } = useSurrender();
  const { stepInfo } = useSteppedWorkflowContext();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(dateStepSchema),
    defaultValues: state.dateStep,
  });

  // @TODO: CUI-919 - get this from the policy
  const NET_SURRENDER_VALUE = 250343.12;

  const onSubmit: SubmitHandler<z.infer<typeof dateStepSchema>> = () => {
    dispatch({
      type: SurrenderAction.SET_SURRENDER_DATE_STEP,
      payload: {
        dateStep: {
          surrenderDate: dayjs(form.getValues('surrenderDate')).format(
            ZAHARA_DATE_FORMAT
          ),
          netSurrenderValue: NET_SURRENDER_VALUE,
        },
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
      <div className={styles.field}>
        <Label labelFor="surrender-amount">Surrender Amount</Label>
        {/* @TODO: CUI-919 - get this from the policy */}
        <p className="typography-content-value">
          {formatUSDollars(NET_SURRENDER_VALUE)}
        </p>
      </div>

      <div className={styles.field}>
        <Label labelFor="surrender-date">Surrender Date</Label>
        <div>
          <Controller
            control={form.control}
            name="surrenderDate"
            render={({ field }) => (
              <FieldDate
                {...field}
                disableBeforeDate={dayjs().subtract(1, 'day').toDate()}
                id="surrender-date"
                defaultDate={form.formState.defaultValues?.surrenderDate}
                onDateSelect={date => {
                  const formattedDate = dayjs(date).format(ZAHARA_DATE_FORMAT);
                  field.onChange(formattedDate);
                }}
              />
            )}
          />
          {form.formState.errors.surrenderDate?.message && (
            <AssistiveText
              text={form.formState.errors.surrenderDate.message}
              variant={AssistiveTextVariant.Error}
            />
          )}
        </div>
      </div>
    </form>
  );
};
