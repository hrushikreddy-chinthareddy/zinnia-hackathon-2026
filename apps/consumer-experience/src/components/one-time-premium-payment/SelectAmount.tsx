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

const dateInvalidMessage = 'Please enter a valid date';
const dateOutOfRangeMessage = 'Date must between today and next 60 days';

export const SelectAmount = ({
  moveToNextStep,
}: {
  moveToNextStep?: () => void;
}) => {
  const [dateInvalidError, setDateInvalidError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const sixtyDaysInFutureDay = dayjs().add(61, 'day').format('YYYY-MM-DD');

  const validateAndMove = () => {
    console.log(dayjs(selectedDate).isBefore(new Date()));
    if (selectedDate) {
      if (
        // TODO: today is returning true so not allowing to move forward
        dayjs(selectedDate).isBefore(new Date()) ||
        dayjs(selectedDate).isAfter(new Date(sixtyDaysInFutureDay))
      ) {
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
        <Label labelFor="one-time-premium-payment-date mb">
          Effective date
        </Label>
        <DateInput
          onSelect={setSelectedDate}
          selectedDate={selectedDate}
          disableAfterDate={new Date(sixtyDaysInFutureDay)}
          disableBeforeDate={new Date()}
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

// calendar input
// verify mobile

// add some text instructions since you can input as well saying
//  --- please enter valid Date
//  -- can only schedule payment within next 60 days
// fix the hover color
// when clicking into the input, open the calendar
// add calendar icon
