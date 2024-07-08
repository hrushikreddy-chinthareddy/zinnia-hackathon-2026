import * as ReactPopover from '@radix-ui/react-popover';
import { Icon, IconType, DatePicker } from '@zinnia/bloom/components';
import { useCallback, useEffect, useState } from 'react';

import { isValidDate } from '@/utils/dates';

import styles from './DateInput.module.css';

// From React DayPicker types
/** A matcher to match a day falling before and/or after two dates, where the dates are not included. */
type DateInterval = {
  before: Date;
  after: Date;
};

export const DateInput = ({
  disableBeforeDate,
  disableAfterDate,
  onSelect,
  selectedDate,
  id,
}: {
  disableBeforeDate?: Date;
  disableAfterDate?: Date;
  id?: string;
  onSelect: (date: Date | undefined) => void;
  selectedDate?: Date;
}) => {
  const [inputVal, setInputVal] = useState<string>(
    selectedDate?.toLocaleDateString() || ''
  );
  const [currentDate, setCurrentDate] = useState<Date | undefined>(
    selectedDate
  );
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
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
    setCalendarOpen(false);
  };

  useEffect(() => {
    // TODO: should this validation happen here? or in the consumer of the component?
    if (currentDate && isValidDate(currentDate.toString())) {
      onSelect(currentDate);
    } else {
      onSelect(undefined);
    }
  }, [currentDate, onSelect]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    const regex = /^[0-9/]+$/;

    if (!regex.test(e.key)) {
      e.preventDefault();
      return;
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div className={styles.inputGroup}>
      <input
        className={`typography-content-body-sm ${styles.input}`}
        type="text"
        name="date"
        id={id}
        value={inputVal}
        onChange={handleInputChange}
        placeholder="Please select a date"
      />
      <ReactPopover.Root open={calendarOpen} onOpenChange={setCalendarOpen}>
        <ReactPopover.Trigger>
          <Icon
            type={IconType.BANK}
            color="var(--color-base-icon-icon-action)"
          />
        </ReactPopover.Trigger>
        <ReactPopover.Portal>
          <ReactPopover.Content align="end" side="bottom">
            <div className={styles.datePickerContainer}>
              <DatePicker
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                defaultMonth={new Date()}
                disabled={
                  {
                    before: disableBeforeDate,
                    after: disableAfterDate,
                  } as DateInterval
                }
              />
            </div>
          </ReactPopover.Content>
        </ReactPopover.Portal>
      </ReactPopover.Root>
    </div>
  );
};
