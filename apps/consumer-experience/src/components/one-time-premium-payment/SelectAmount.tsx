'use client';

import {
  Button,
  Icon,
  IconType,
  Label,
  Popover,
} from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { DEFAULT_DATE_FORMAT, ZAHARA_DATE_FORMAT } from '@/utils/dates';

import { CancelDialogLink } from './CancelDialogLink';
import { FormStepWrapper } from './FormStepWrapper';
import premiumStyles from './OneTimePremiumPayment.module.css';
import { getStepInfo, Steps } from './steps';
import { FieldDate } from '../field/date/FieldDate';
import { FieldStatus } from '../field/types';
import { FieldValue } from '../field/value/FieldValue';
import { useOttp } from '../providers/one-time-premium-payment/OttpContext';
import { OttpAction } from '../providers/one-time-premium-payment/types';

export const dateInvalidMessage = 'Please enter a valid date';
export const dateOutOfRangeMessage =
  'Date must be between today and next 60 days';
export const PREMIUM_PAYMENT_AMOUNT = 'Premium payment amount';

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
  planCode,
  policyNumber,
  paymentFee,
}: {
  planCode: string;
  policyNumber: string;
  paymentFee: number;
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
  const stepInfo = getStepInfo({
    planCode,
    policyNumber,
    step: Steps.AMOUNT,
  });

  useEffect(() => {
    dispatch({
      type: OttpAction.SET_PAYMENT_FEE,
      payload: paymentFee,
    });
  }, [dispatch, paymentFee]);

  const saveAndMove = () => {
    const nextUrl = stepInfo.nextStepUrl;
    dispatch({
      type: OttpAction.SET_EFFECTIVE_DATE,
      payload: dayjs(getValues('effectiveDate')).format(ZAHARA_DATE_FORMAT),
    });
    dispatch({
      type: OttpAction.SET_PAYMENT_AMOUNT,
      payload: Number(getValues('paymentAmount')),
    });
    router.push(nextUrl);
  };

  return (
    <FormStepWrapper
      currentStep={Steps.AMOUNT}
      planCode={planCode}
      policyNumber={policyNumber}
    >
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
                            width={16}
                            height={16}
                          />
                        }
                      >
                        <p>
                          Enter the amount you would like to pay into your
                          policy. Keep in mind there are limits (set by federal
                          laws) to the amount you can pay without impacting your
                          coverage or losing tax advantages.
                        </p>
                        {/* // TODO: where does this value come from? */}
                        {/* <p>
                          Currently, you may pay up to [MEC limit value, CVAT
                          value, Guideline premium value, whichever is the
                          lesser of] without changing the nature of your policy
                          or it's tax advantages. If you'd like to pay more than
                          this, we suggest speaking with a financial
                          professional (like a tax advisor) who can help walk
                          you through the consequences first.
                        </p> */}
                      </Popover>,
                    ]}
                  >
                    {PREMIUM_PAYMENT_AMOUNT}
                  </Label>
                }
                placeholder=""
                // TODO: what should this be?
                name="one-time-premium-payment"
              />
            )}
          />
        </div>
        {paymentFee > 0 && (
          <p className={`${premiumStyles.note} typography-content-body-sm`}>
            Note: Your policy charges a {paymentFee}% fee for every premium
            payment. See your policy documents for more details.
          </p>
        )}
        {!paymentFee && (
          <p className={`${premiumStyles.note} typography-content-body-sm`}>
            Note: Your policy doesn’t charge fees for premium payments.
          </p>
        )}

        <div className={premiumStyles.buttonGroup}>
          <Button mode="primary" type="submit">
            Continue
          </Button>
          <CancelDialogLink planCode={planCode} policyNumber={policyNumber} />
        </div>
      </form>
    </FormStepWrapper>
  );
};
