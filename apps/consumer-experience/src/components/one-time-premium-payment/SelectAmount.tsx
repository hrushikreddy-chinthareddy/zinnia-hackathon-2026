'use client';

import {
  Button,
  Label,
  AssistiveText,
  AssistiveTextVariant,
} from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import premiumStyles from './OneTimePremiumPayment.module.css';
import { DateInput } from '../date-input/DateInput';

export const dateInvalidMessage = 'Please enter a valid date';
export const dateOutOfRangeMessage =
  'Date must be between today and next 60 days';

export const SelectAmount = ({
  moveToNextStep,
}: {
  moveToNextStep?: () => void;
}) => {
  const [dateInvalidError, setDateInvalidError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const sixtyDaysInFutureDay = dayjs().add(60, 'day').format('YYYY-MM-DD');

  const validateAndMove = () => {
    if (selectedDate) {
      if (
        dayjs(selectedDate).isBefore(new Date(), 'day') ||
        dayjs(selectedDate).isAfter(new Date(sixtyDaysInFutureDay))
      ) {
        console.log('SELECTED', selectedDate);
        setDateInvalidError(dateOutOfRangeMessage);
        return;
      }
      moveToNextStep?.();
    } else {
      setDateInvalidError(dateInvalidMessage);
    }
  };

  useEffect(() => {
    setDateInvalidError(null);
  }, [selectedDate]);

  return (
    <>
      <div className={`mb-xl ${premiumStyles.dateContainer}`}>
        <Label labelFor="one-time-premium-payment-date">Effective date</Label>
        <DateInput
          onSelect={setSelectedDate}
          selectedDate={selectedDate}
          disableAfterDate={new Date(sixtyDaysInFutureDay)}
          disableBeforeDate={new Date()}
          id="one-time-premium-payment-date"
        />
        {dateInvalidError && (
          <AssistiveText
            className="mt-md"
            variant={AssistiveTextVariant.Error}
            text={dateInvalidError}
            aria-live="polite"
          />
        )}
      </div>
      <div className="mb-xl">
        <Label>Premium payment amount</Label>
      </div>
      {/* // TODO: this only shows if there is a fee */}
      <p className={`${premiumStyles.note} typography-content-body-sm`}>
        Note: Premium payments may have associated fees.
      </p>
      <div className={premiumStyles.buttonGroup}>
        <Button mode="primary" onClick={validateAndMove}>
          Continue
        </Button>
        {/* TODO: show 'are you sure path' */}
        <Button mode="link">Cancel</Button>
      </div>
    </>
  );
};
