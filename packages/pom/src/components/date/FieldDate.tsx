'use client';

import * as ReactPopover from '@radix-ui/react-popover';
import {
  Label,
  AssistiveText,
  AssistiveTextVariant,
  DatePicker,
  Icon,
  IconType,
  FieldStatus,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import React, {
  ChangeEvent,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { handleKeyPressDateCharactersOnly } from './utils';
import fieldStyles from './Field.module.css';
import {
  DateInterval,
  FieldDataActiveTestIds,
  FieldDateProps,
  zIndexOrder,
} from './types';

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
      defaultDate,
      isInSidesheet = false,
      ...props
    },
    ref
  ) => {
    if (
      (label.type as React.JSXElementConstructor<unknown>)?.name !== Label.name
    ) {
      throw new Error('Required field: label is not of type Label');
    }
    const dialogContentRef = useRef<HTMLDivElement | null>(null);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [inputWidth, setInputWidth] = useState(0);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
      defaultDate ? new Date(defaultDate) : undefined
    );
    const [inputVal, setInputVal] = useState(defaultDate);

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

    const inputId = React.useId();
    const status = props.disabled ? FieldStatus.INACTIVE : fieldStatus;
    const clonedLabel = isValidElement(label)
      ? cloneElement(label, {
          labelFor: inputId,
          status,
        })
      : label;

    const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.value) {
        setInputVal('');
        setSelectedDate(undefined);
        onDateSelect?.(undefined);
      } else {
        setInputVal(e.target.value);
        const date = new Date(e.target.value);
        setSelectedDate(date);
        onDateSelect?.(date);
      }
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

        <ReactPopover.Root
          open={calendarOpen}
          onOpenChange={setCalendarOpen}
          modal={true}
        >
          <ReactPopover.Trigger style={{ width: '100%' }}>
            <div
              className={clsx(
                fieldStyles.inputContainer,
                fieldStyles[status],
                'typography-content-body-sm'
              )}
            >
              <input
                autoComplete="off"
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
                value={inputVal?.toString()}
                onChange={handleDateChange}
                {...props}
              />
              <div className={fieldStyles.rightIconContainer}>
                <Icon
                  type={IconType.CALENDAR}
                  color="var(--color-base-icon-icon-action)"
                />
              </div>
            </div>
          </ReactPopover.Trigger>

          <ReactPopover.Content
            ref={dialogContentRef}
            // portalled={false}
            align="end"
            side="bottom"
            style={{
              zIndex: isInSidesheet
                ? zIndexOrder.Dialog
                : zIndexOrder.DatePickerDialog,
            }}
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
        </ReactPopover.Root>
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
