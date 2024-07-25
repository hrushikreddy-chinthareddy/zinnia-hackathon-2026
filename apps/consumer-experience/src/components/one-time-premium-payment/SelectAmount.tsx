'use client';

import { Button, Label } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

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
  console.log(dayjs(date));
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
  const { effectiveDate, paymentAmount: statePaymentAmount } = state;
  const { control, handleSubmit, formState, getValues } = useForm<{
    paymentAmount: number;
    effectiveDate: string;
  }>({
    defaultValues: {
      paymentAmount: statePaymentAmount || undefined,
      effectiveDate: undefined,
    },
  });

  // TODO: there's a better way to do this
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    effectiveDate ? new Date(effectiveDate) : undefined
  );

  const validateAndMove = () => {
    // Do these need to be async?
    dispatch({ type: OttpAction.SET_EFFECTIVE_DATE, payload: selectedDate });
    dispatch({
      type: OttpAction.SET_PAYMENT_AMOUNT,
      payload: getValues('paymentAmount'),
    });
    moveToNextStep?.();
  };

  return (
    <form onSubmit={handleSubmit(validateAndMove)}>
      <div className="mb-xl field-container">
        <Controller
          control={control}
          name="effectiveDate"
          rules={{
            required: dateInvalidMessage,
            validate: {
              dateInRange: v =>
                dateWithinSixtyDayRange(v) || dateOutOfRangeMessage,
            },
          }}
          render={({ field }) => (
            <FieldDate
              {...field}
              label={
                <Label labelFor="one-time-premium-payment-date">
                  Effective date
                </Label>
              }
              name="one-time-premium-payment"
              // TODO: this isn't working on select, it's like the date will change if i set the value,
              // but the value on react hook form is undefined
              onDateSelect={setSelectedDate}
              // selectedDate={selectedDate}
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
          rules={{ required: 'Please enter a valid payment amount' }}
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
