import * as ReactPopover from '@radix-ui/react-popover';
import { Icon, IconType, DatePicker } from '@zinnia/bloom/components';
import { useCallback, useEffect, useState } from 'react';

import { isValidDate } from '@/utils/dates';

import premiumStyles from '../one-time-premium-payment/OneTimePremiumPayment.module.css';

export const DateInput = ({
  disableBeforeDate,
  disableAfterDate,
  onSelect,
  selectedDate,
}: {
  disableBeforeDate?: Date;
  disableAfterDate?: Date;
  onSelect: (date: Date | undefined) => void;
  selectedDate?: Date;
}) => {
  const [inputVal, setInputVal] = useState<string>();
  const [currentDate, setCurrentDate] = useState<Date | undefined>(
    selectedDate
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value); // keep the input value in sync
    setCurrentDate(e.target.value ? new Date(e.target.value) : undefined);
  };

  const handleDateSelect = (date?: Date) => {
    if (!date) {
      setInputVal('');
      setCurrentDate(undefined);
    } else {
      setCurrentDate(date);
      setInputVal(date.toLocaleDateString());
    }
  };

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    const regex = /^[0-9/]+$/;

    if (!regex.test(e.key)) {
      e.preventDefault();
      return;
    }
  }, []);

  useEffect(() => {
    if (currentDate && isValidDate(currentDate.toString())) {
      onSelect(currentDate);
    } else {
      onSelect(undefined);
    }
  }, [currentDate, onSelect]);

  useEffect(() => {
    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div className={premiumStyles.inputGroup}>
      <input
        className={`typography-content-body-sm ${premiumStyles.input}`}
        type="text"
        name="date"
        id="one-time-premium-payment-date"
        defaultValue={new Date(selectedDate || '')?.toLocaleDateString()}
        value={inputVal}
        onChange={handleInputChange}
      />
      <ReactPopover.Root>
        <ReactPopover.Trigger>
          <Icon
            type={IconType.BANK}
            color="var(--color-base-icon-icon-action)"
          />
        </ReactPopover.Trigger>
        <ReactPopover.Portal>
          <ReactPopover.Content align="end" side="bottom">
            <div className={premiumStyles.datePickerContainer}>
              <DatePicker
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                defaultMonth={new Date()}
                disabled={
                  {
                    before: disableBeforeDate,
                    after: disableAfterDate,
                    // TODO: need to fix this type
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  } as any
                }
              />
            </div>
          </ReactPopover.Content>
        </ReactPopover.Portal>
      </ReactPopover.Root>
    </div>
  );
};
