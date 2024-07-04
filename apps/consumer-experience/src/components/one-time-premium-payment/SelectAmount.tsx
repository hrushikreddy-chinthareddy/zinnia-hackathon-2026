'use client';

import * as ReactPopover from '@radix-ui/react-popover';
import {
  Icon,
  IconType,
  Label,
  Popover,
  PopoverPlacement,
  DatePicker,
} from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';

import { isValidDate } from '@/utils/dates';

import premiumStyles from './OneTimePremiumPayment.module.css';

export const SelectAmount = ({
  moveToNextStep,
}: {
  moveToNextStep?: () => void;
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const sixtyDaysInFutureDay = dayjs().add(61, 'day').format('YYYY-MM-DD');

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    const regex = /^[0-9/]+$/;
    console.log(e.key);
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

  const setDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isValidDate(e.target.value)) {
      setSelectedDate(new Date(e.target.value));
    } else {
      setSelectedDate(undefined);
    }
  };

  return (
    <>
      <div className="mb-xl">
        <Label>
          Effective date{' '}
          <input
            className="typography-content-body-sm"
            type="text"
            name="date"
            id="date"
            defaultValue={new Date(selectedDate || '')?.toLocaleDateString()}
            onBlur={setDate}
          />
        </Label>
        <ReactPopover.Root>
          <ReactPopover.Trigger>
            <Icon type={IconType.BANK} />
          </ReactPopover.Trigger>
          <ReactPopover.Portal>
            <ReactPopover.Content align="end" side="bottom">
              <div>
                <DatePicker
                  mode="single"
                  selected={selectedDate || new Date()}
                  onSelect={setSelectedDate}
                  defaultMonth={selectedDate || new Date()}
                  disabled={{
                    before: new Date(),
                    after: new Date(sixtyDaysInFutureDay),
                  }}
                />
              </div>
            </ReactPopover.Content>
          </ReactPopover.Portal>
        </ReactPopover.Root>
      </div>
      <div className="mb-xl">
        <Label
          interactiveElements={[
            <Popover
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
      </div>
      {/* // TODO: this only shows if there is a fee */}
      <p className={`${premiumStyles.note} typography-content-body-sm`}>
        Note: Premium payments may have associated fees.
      </p>
      <div className={premiumStyles.buttonGroup}>
        <Button mode="primary" onClick={moveToNextStep}>
          Continue
        </Button>
        {/* TODO: show 'are you sure path', this should actually be a link */}
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
// fix styling
// fix the hover color
// when clicking into the input, open the calendar
// add calendar icon
