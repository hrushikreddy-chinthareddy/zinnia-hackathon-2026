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
import {
  ChangeEvent,
  cloneElement,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';

import { zIndexOrder } from '@/utils/zIndexOrder';

import { handleKeyPressDateCharactersOnly } from './utils';
import fieldStyles from '../Field.module.css';
import {
  DateInterval,
  FieldDataActiveTestIds,
  FieldDateProps,
  FieldStatus,
} from '../types';

export const FieldDate = forwardRef<HTMLInputElement, FieldDateProps>(
  (
    {
      errorMessage = '',
      label,
      fieldStatus = FieldStatus.DEFAULT,
      fieldSize,
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
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [inputWidth, setInputWidth] = useState(0);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
      new Date(props.defaultValue)
    );
    const [inputVal, setInputVal] = useState(props.defaultValue);

    const inputContainer = useRef<HTMLInputElement>(null);
    const innerInputRef = useRef<HTMLInputElement>(null);
    // Exposes the input ref to the parent
    useImperativeHandle(ref, () => innerInputRef.current!);

    useEffect(() => {
      if (inputContainer.current) {
        setInputWidth(inputContainer.current.offsetWidth);
      }
    }, [inputContainer]);

    useEffect(() => {
      const inputRefCurrent = innerInputRef?.current;
      inputRefCurrent?.addEventListener(
        'keypress',
        handleKeyPressDateCharactersOnly
      );
      return () => {
        inputRefCurrent?.removeEventListener(
          'keypress',
          handleKeyPressDateCharactersOnly
        );
      };
    }, []);

    const inputId = uuidv4();
    const status = props.disabled ? FieldStatus.INACTIVE : fieldStatus;
    const clonedLabel = cloneElement(label, {
      labelFor: inputId,
      status,
    });

    const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
      setInputVal(e.target.value);
      const date = new Date(e.target.value);
      setSelectedDate(date);
      onDateSelect?.(date);
    };

    const handleDateSelect = (date: Date | undefined) => {
      if (!date) {
        setInputVal('');
        setSelectedDate(undefined);
        onDateSelect?.(undefined);
      } else {
        setInputVal(date?.toLocaleDateString() || '');
        setSelectedDate(date);
        onDateSelect?.(date);
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
            ref={innerInputRef}
            data-testid={FieldDataActiveTestIds.INPUT}
            type="text"
            className={clsx(
              fieldStyles.input,
              fieldSize && fieldStyles[fieldSize],
              fieldStyles[status],
              'typography-content-body'
            )}
            value={inputVal}
            onChange={handleDateChange}
            {...props}
          />
          <ReactPopover.Root open={calendarOpen} onOpenChange={setCalendarOpen}>
            <ReactPopover.Trigger className={fieldStyles.rightIconContainer}>
              <Icon type={IconType.CALENDAR} />
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
                    selected={selectedDate ? new Date(selectedDate) : undefined}
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
