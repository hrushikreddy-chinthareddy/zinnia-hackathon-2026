'use client';

import { Button, Label } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';

import { DEFAULT_DATE_FORMAT } from '@/utils/dates';

import premiumStyles from './OneTimePremiumPayment.module.css';
import { FieldDate } from '../field/date/FieldDate';
import { FieldStatus } from '../field/types';
import { FieldValue } from '../field/value/FieldValue';
import { useOttp } from '../providers/one-time-premium-payment/OttpContext';
import { OttpAction } from '../providers/one-time-premium-payment/types';
import { CancelDialogLink } from '../transactions/CancelDialogLink';

export const dateInvalidMessage = 'Please enter a valid date';
export const dateOutOfRangeMessage =
  'Date must be between today and next 60 days';

const sixtyDaysInFutureDay = dayjs().add(60, 'day').format('YYYY-MM-DD');
const dateWithinSixtyDayRange = (date: string) => {
  return dayjs(date).isBetween(
    dayjs().format('YYYY-MM-DD'),
    sixtyDaysInFutureDay,
    'day',
    // This means its inclusive of today and last day
    '[]'
  );
};

export const SelectAmount = ({
  moveToNextStep,
  planCode,
  policyNumber,
}: {
  moveToNextStep?: () => void;
  planCode: string;
  policyNumber: string;
}) => {
  const router = useRouter();
  const { state, dispatch } = useOttp();
  const {
    effectiveDate: stateEffectiveDate,
    paymentAmount: statePaymentAmount,
  } = state;
  const { control, handleSubmit, formState, getValues } = useForm<{
    paymentAmount: number;
    effectiveDate: string;
  }>({
    defaultValues: {
      paymentAmount: statePaymentAmount || undefined,
      effectiveDate: stateEffectiveDate
        ? dayjs(stateEffectiveDate).format(DEFAULT_DATE_FORMAT)
        : undefined,
    },
  });

  const saveAndMove = () => {
    dispatch({
      type: OttpAction.SET_EFFECTIVE_DATE,
      payload: getValues('effectiveDate'),
    });
    dispatch({
      type: OttpAction.SET_PAYMENT_AMOUNT,
      payload: Number(getValues('paymentAmount')),
    });
    moveToNextStep?.();
  };

  return (
    <form onSubmit={handleSubmit(saveAndMove)}>
      <div className="mb-xl field-container">
        <Controller
          control={control}
          name="effectiveDate"
          rules={{
            required: dateInvalidMessage,
            validate: {
              dateInRange: v =>
                dateWithinSixtyDayRange(v) || dateOutOfRangeMessage,
              dateIsValid: v => dayjs(v).isValid() || dateInvalidMessage,
            },
          }}
          render={({ field }) => (
            <FieldDate
              label={
                <Label labelFor="one-time-premium-payment-date">
                  Effective date
                </Label>
              }
              name="one-time-premium-payment"
              onDateSelect={date =>
                field.onChange(dayjs(date).format(DEFAULT_DATE_FORMAT))
              }
              defaultValue={formState.defaultValues?.effectiveDate || ''}
              disableAfterDate={new Date(sixtyDaysInFutureDay)}
              disableBeforeDate={new Date()}
              fieldStatus={
                formState.errors.effectiveDate
                  ? FieldStatus.ERROR
                  : FieldStatus.DEFAULT
              }
              errorMessage={formState.errors.effectiveDate?.message}
            />
          )}
        />
      </div>
      <div className="mb-xl field-container">
        <Controller
          control={control}
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
                formState.errors.paymentAmount
                  ? FieldStatus.ERROR
                  : FieldStatus.DEFAULT
              }
              errorMessage={formState.errors.paymentAmount?.message}
              label={<Label>Premium payment amount</Label>}
              placeholder=""
              // TODO: what should this be?
              name="one-time-premium-payment"
            />
          )}
        />
      </div>
      {/* // TODO: this only shows if there is a fee */}
      <p className={`${premiumStyles.note} typography-content-body-sm`}>
        Note: Premium payments may have associated fees.
      </p>
      <div className={premiumStyles.buttonGroup}>
        <Button mode="primary" type="submit">
          Continue
        </Button>
        <CancelDialogLink
          planCode={planCode}
          policyNumber={policyNumber}
          router={router}
        />
      </div>
    </form>
  );
};
