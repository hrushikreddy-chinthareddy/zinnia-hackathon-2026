import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localData from 'dayjs/plugin/localeData';
import React, { ChangeEvent, useRef, useState } from 'react';

import DatePicker from '@deps/components/date-picker/date-picker';
import { FieldType } from '@deps/components/fields/field';
import Field, { FieldProps } from '@deps/components/fields/field';
import { useOutsideClick } from '@deps/hooks/useOutsideClick';
import { FieldDateSelectTest } from '@deps/jest/constants/test-id-constants';
import { ReactComponent as CalendarIcon } from '@deps/styles/elements/icons/icons_outlined/calendar.svg';
import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';

dayjs.extend(customParseFormat);
dayjs.extend(localData);

export type FieldDateSelectProps = {
    value: string;
    label?: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    isFutureDateDisabled?: boolean;
    isDateAllowed?: (dayjsDate: Dayjs) => boolean;
} & FieldProps;
export const DATE_PICKER_FORMAT = NUMERIC_DATE_FORMAT;

export default function FieldDateSelect({
    value,
    label,
    onChange,
    isFutureDateDisabled = true,
    isDateAllowed,
    ...rest
}: FieldDateSelectProps) {
    const [open, setOpen] = useState(false);

    const date = dayjs(value, DATE_PICKER_FORMAT, true).isValid() ? dayjs(value, DATE_PICKER_FORMAT).toDate() : null;
    const handleDateSelect = (_year: number, _month: number, _day: number) => {
        onChange({
            target: {
                value: dayjs(dayjs().year(_year).month(_month).date(_day).toDate()).format(DATE_PICKER_FORMAT),
            },
        } as ChangeEvent<HTMLInputElement>);
        handleClose();
    };
    const handleClose = () => setOpen(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useOutsideClick(containerRef, open, handleClose);

    return (
        <div data-testid={FieldDateSelectTest.Container} className="relative" ref={containerRef}>
            <Field
                value={value}
                onChange={onChange}
                formatOptions={{ format: '##/##/####' }}
                label={label}
                endIcon={
                    <CalendarIcon
                        width={22}
                        height={22}
                        className={`my-auto ${rest.disabled ? 'text-secondary' : ''}`}
                        onClick={() => setOpen(!open)}
                    />
                }
                type={FieldType.BaseActive}
                {...rest}
            />
            <div className="absolute top-[70px] z-20 w-[fit-content] !min-w-[250px] rounded-md bg-white shadow-elevation-light-16">
                <DatePicker
                    isDateAllowed={isDateAllowed}
                    isFutureDateDisabled={isFutureDateDisabled}
                    open={open}
                    date={date}
                    handleDateSelect={handleDateSelect}
                />
            </div>
        </div>
    );
}
