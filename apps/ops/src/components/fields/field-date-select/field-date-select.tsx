import clsx from 'clsx';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localData from 'dayjs/plugin/localeData';
import { ChangeEvent, useRef, useState } from 'react';

import DatePicker, {
    DatePickerTypes,
    DateQuarter,
    Quarter,
} from '@deps/components/date-picker/date-picker';
import Field, { FieldType, FieldProps } from '@deps/components/fields/field';
import { useOutsideClick } from '@deps/hooks/useOutsideClick';
import { FieldDateSelectTest } from '@deps/jest/constants/test-id-constants';
import { ReactComponent as CalendarIcon } from '@deps/styles/elements/icons/icons_outlined/calendar.svg';
import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';

import styles from './field-date-select.module.css';

dayjs.extend(customParseFormat);
dayjs.extend(localData);

export type FieldDateSelectProps = {
    value: string;
    label?: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    isFutureDateDisabled?: boolean;
    isPastDateDisabled?: boolean;
    disableFormat?: boolean;
    datePickerType?: DatePickerTypes;
    isDateAllowed?: (dayjsDate: Dayjs) => boolean;
    showMonths?: boolean;
} & FieldProps;
export const DATE_PICKER_FORMAT = NUMERIC_DATE_FORMAT;

export default function FieldDateSelect({
    value,
    label,
    onChange,
    isFutureDateDisabled = true,
    isPastDateDisabled = false,
    isDateAllowed,
    disableFormat,
    datePickerType,
    showMonths,
    ...rest
}: FieldDateSelectProps) {
    const [open, setOpen] = useState(false);
    const formatOptions = !disableFormat ? { format: '##/##/####' } : undefined;
    let date: Date | DateQuarter | null = null;
    if (datePickerType === DatePickerTypes.Quarterly) {
        try {
            const [year, quarter] = value.split('-');
            const dateQuarter: DateQuarter = {
                year: Number(year),
                quarter: quarter as Quarter,
            };
            date = dateQuarter;
        } catch (error) {
            console.error('Invalid JSON string:', value, error);
            date = null;
        }
    } else {
        date = dayjs(value, DATE_PICKER_FORMAT, true).isValid()
            ? dayjs(value, DATE_PICKER_FORMAT).toDate()
            : null;
    }

    const handleCustomSelection = (_year: number, _quarter?: Quarter) => {
        const value = _quarter ? `${_year}-${_quarter}` : _year.toString();

        onChange({
            target: {
                value: value,
            },
        } as unknown as ChangeEvent<HTMLInputElement>);
        handleClose();
        focusOnField();
    };
    const handleDateSelect = (_year: number, _month: number, _day: number) => {
        onChange({
            target: {
                value: dayjs(
                    dayjs().year(_year).month(_month).date(_day).toDate()
                ).format(DATE_PICKER_FORMAT),
            },
        } as unknown as ChangeEvent<HTMLInputElement>);
        handleClose();
        focusOnField();
    };
    const handleClose = () => setOpen(false);
    const handleTab = () => {
        setOpen(false);

        setTimeout(() => {
            const focusableElements = document.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const currentElement = containerRef.current?.querySelector('input');

            if (currentElement && focusableElements.length > 0) {
                const currentIndex =
                    Array.from(focusableElements).indexOf(currentElement);
                const nextIndex = currentIndex + 1;

                if (nextIndex < focusableElements.length) {
                    (focusableElements[nextIndex] as HTMLElement).focus();
                }
            }
        }, 0);
    };

    const focusOnField = () => {
        setTimeout(() => {
            const inputElement = containerRef.current?.querySelector('input');
            if (inputElement) {
                (inputElement as HTMLElement).focus();
            }
        }, 0);
    };

    const handleEscape = () => {
        setOpen(false);
        focusOnField();
    };
    const containerRef = useRef<HTMLDivElement>(null);

    useOutsideClick(containerRef, open, handleClose);

    return (
        <div
            data-testid={FieldDateSelectTest.Container}
            className={clsx('relative', rest.className)}
            ref={containerRef}
            onKeyDown={(e) => {
                if (e.key === 'Escape') {
                    e.stopPropagation();
                    e.preventDefault();
                    handleEscape();
                }
            }}
        >
            <Field
                value={value}
                onChange={onChange}
                formatOptions={formatOptions}
                label={label}
                endIcon={
                    <button
                        type="button"
                        className={`my-auto p-1 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                            rest.disabled
                                ? 'text-secondary cursor-not-allowed'
                                : 'cursor-pointer hover:bg-gray-100'
                        }`}
                        onClick={() => setOpen(!open)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setOpen(!open);
                            }
                        }}
                        disabled={rest.disabled}
                        aria-label="Open date picker"
                        tabIndex={0}
                    >
                        <CalendarIcon
                            width={22}
                            height={22}
                            className={`${
                                rest.disabled ? 'text-secondary' : ''
                            }`}
                        />
                    </button>
                }
                type={FieldType.BaseActive}
                {...rest}
            />
            <div
                className={clsx(
                    'absolute top-[70px] w-[fit-content] !min-w-[250px] rounded-md bg-white shadow-elevation-light-16',
                    styles.z500
                )}
            >
                <DatePicker
                    isDateAllowed={isDateAllowed}
                    isFutureDateDisabled={isFutureDateDisabled}
                    isPastDateDisabled={isPastDateDisabled}
                    open={open}
                    date={date}
                    handleDateSelect={handleDateSelect}
                    handleCustomSelection={handleCustomSelection}
                    datePickerType={datePickerType}
                    showMonths={showMonths}
                    onTab={handleTab}
                    onEscape={handleEscape}
                />
            </div>
        </div>
    );
}
