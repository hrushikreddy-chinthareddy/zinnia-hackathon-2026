'use client';

import {
  Button,
  Label,
  AssistiveText,
  AssistiveTextVariant,
  Popover,
  Icon,
  IconType,
  PopoverPlacement,
} from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import premiumStyles from './OneTimePremiumPayment.module.css';
import { DateInput } from '../date-input/DateInput';
import { FieldValue } from '../field/value/FieldValue';
import {
  OttpAction,
  useOttp,
} from '../providers/one-time-premium-payment/OttpProvider';
import { CancelDialogLink } from '../transactions/CancelDialogLink';

export const dateInvalidMessage = 'Please enter a valid date';
export const dateOutOfRangeMessage =
  'Date must be between today and next 60 days';

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
  const { effectiveDate } = state;
  const [dateInvalidError, setDateInvalidError] = useState<string | null>(null);

  // TODO: there's a better way to do this
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    effectiveDate ? new Date(effectiveDate) : undefined
  );
  const [paymentAmount, setPaymentAmount] = useState(0);

  const sixtyDaysInFutureDay = dayjs().add(60, 'day').format('YYYY-MM-DD');

  const validateAndMove = () => {
    if (selectedDate) {
      if (
        dayjs(selectedDate).isBefore(new Date(), 'day') ||
        dayjs(selectedDate).isAfter(new Date(sixtyDaysInFutureDay))
      ) {
        setDateInvalidError(dateOutOfRangeMessage);
        return;
      }

      // Do these need to be async?
      dispatch({ type: OttpAction.SET_EFFECTIVE_DATE, payload: selectedDate });
      dispatch({ type: OttpAction.SET_PAYMENT_AMOUNT, payload: paymentAmount });
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
          onDateSelect={setSelectedDate}
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
      <div className="mb-xl field-container">
        <FieldValue
          // TODO: did Ed fix this in his branch?
          // value={paymentAmount}
          onChange={e => setPaymentAmount(+e.target.value)}
          label={
            <Label
              interactiveElements={[
                <Popover
                  key="tooltip"
                  title="popover title"
                  trigger={
                    <Icon
                      type={IconType.CIRCLE_INFO}
                      small
                      color="var(--color-base-icon-icon-tooltip, #ff7500)"
                    />
                  }
                  placement={PopoverPlacement.BottomRight}
                >
                  <div>
                    <p>Popover content</p>
                  </div>
                </Popover>,
              ]}
            >
              Premium payment amount
            </Label>
          }
          placeholder=""
          // TODO: what should this be?
          name="one-time-premium-payment"
        />
      </div>
      {/* // TODO: this only shows if there is a fee */}
      <p className={`${premiumStyles.note} typography-content-body-sm`}>
        Note: Premium payments may have associated fees.
      </p>
      <div className={premiumStyles.buttonGroup}>
        <Button mode="primary" onClick={validateAndMove}>
          Continue
        </Button>
        <CancelDialogLink
          planCode={planCode}
          policyNumber={policyNumber}
          router={router}
        />
      </div>
    </>
  );
};
