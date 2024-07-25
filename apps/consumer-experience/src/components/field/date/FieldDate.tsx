'use client';

import * as ReactPopover from '@radix-ui/react-popover';
import {
  Label,
  AssistiveText,
  AssistiveTextVariant,
  DatePicker,
  Icon,
  IconType,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { cloneElement, forwardRef, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { isValidDate } from '@/utils/dates';
import { zIndexOrder } from '@/utils/zIndexOrder';

import fieldStyles from '../Field.module.css';
import {
  DateInterval,
  FieldDataActiveTestIds,
  FieldDateProps,
  FieldStatus,
} from '../types';

const handleKeyPress = (e: KeyboardEvent) => {
  const regex = /^[0-9/]+$/;

  if (!regex.test(e.key)) {
    e.preventDefault();
    return;
  }
};

export const FieldDate = forwardRef<HTMLInputElement, FieldDateProps>(
  (
    {
      errorMessage = '',
      label,
      fieldStatus = FieldStatus.DEFAULT,
      fieldSize,
      selectedDate,
      onDateSelect = () => {},
      disableBeforeDate,
      disableAfterDate,
      ...props
    },
    ref
  ) => {
    if ((label.type as React.JSXElementConstructor<any>)?.name !== Label.name) {
      throw new Error('Required field: label is not of type Label');
    }

    const [inputVal, setInputVal] = useState<string>(
      selectedDate?.toLocaleDateString() || ''
    );
    const [currentDate, setCurrentDate] = useState<Date | undefined>(
      selectedDate
    );
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [inputWidth, setInputWidth] = useState(0);

    const inputContainer = useRef<HTMLInputElement>(null);
    const input = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (inputContainer.current) {
        setInputWidth(inputContainer.current.offsetWidth);
      }
    }, [inputContainer]);

    const inputId = uuidv4();
    const status = props.disabled ? FieldStatus.INACTIVE : fieldStatus;
    const clonedLabel = cloneElement(label, {
      labelFor: inputId,
      status,
    });

    useEffect(() => {
      const inputRefCurrent = input?.current;
      inputRefCurrent?.addEventListener('keypress', handleKeyPress);
      return () => {
        inputRefCurrent?.removeEventListener('keypress', handleKeyPress);
      };
    }, []);

    useEffect(() => {
      // TODO: should this validation happen here? or in the consumer of the component?
      if (currentDate && isValidDate(currentDate.toString())) {
        onDateSelect(currentDate);
      } else {
        onDateSelect(undefined);
      }
    }, [currentDate, onDateSelect]);

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

    return (
      <div ref={inputContainer}>
        <div data-testid={FieldDataActiveTestIds.LABEL}>{clonedLabel}</div>
        <div
          className={clsx(
            fieldStyles.inputContainer,
            fieldStyles[status],
            'typography-content-body-sm'
          )}
        >
          <input
            id={inputId}
            // TODO: need to update this to use ref forwarded and local, possibly use
            // useImperativeHandle https://stackoverflow.com/questions/75750807/how-to-use-react-forwardref-with-own-ref-in-the-component
            ref={input}
            data-testid={FieldDataActiveTestIds.INPUT}
            type="text"
            className={clsx(
              fieldStyles.input,
              fieldSize && fieldStyles[fieldSize],
              fieldStyles[status],
              'typography-content-body'
            )}
            value={inputVal}
            onChange={handleInputChange}
            {...props}
          />
          <ReactPopover.Root open={calendarOpen} onOpenChange={setCalendarOpen}>
            <ReactPopover.Trigger className={fieldStyles.rightIconContainer}>
              <Icon
                type={IconType.CALENDAR}
                color="var(--color-base-icon-icon-action)"
              />
            </ReactPopover.Trigger>
            <ReactPopover.Portal>
              <ReactPopover.Content
                align="end"
                side="bottom"
                style={{ zIndex: zIndexOrder.DatePickerDialog }}
              >
                <div
                  className={fieldStyles.datePickerContainer}
                  style={{ width: inputWidth }}
                >
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
        {fieldStatus === FieldStatus.ERROR && errorMessage && (
          <div data-testid={FieldDataActiveTestIds.ERROR_MESSAGE}>
            <AssistiveText
              className={fieldStyles.assistiveMessage}
              text={errorMessage}
              variant={AssistiveTextVariant.Error}
            />
          </div>
        )}
      </div>
    );
  }
);

FieldDate.displayName = 'FieldDate';
