import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localData from 'dayjs/plugin/localeData';
import React, { ChangeEvent, useRef, useState } from 'react';

import DatePicker from '@deps/components/date-picker/date-picker';
import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import { useOutsideClick } from '@deps/hooks/useOutsideClick';
import { ReactComponent as CalendarIcon } from '@deps/styles/elements/icons/icons_outlined/calendar.svg';
import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';

dayjs.extend(customParseFormat);
dayjs.extend(localData);

export type FieldDateSelectRangeProps = {
    startValue: string;
    endValue: string;
    startLabel?: string;
    endLabel?: string;
    startOnChange: (event: ChangeEvent<HTMLInputElement>) => void;
    endOnChange: (event: ChangeEvent<HTMLInputElement>) => void;
    startVariant?: FieldVariant;
    endVariant?: FieldVariant;
    startMessage?: string;
    endMessage?: string;
    closeOnDateSelect?: boolean;
    placeholder?: string;
    size?: FieldSize;
};

export default function FieldDateSelectRange({
    startValue,
    endValue,
    startLabel,
    endLabel,
    startOnChange,
    endOnChange,
    startVariant,
    endVariant,
    startMessage,
    endMessage,
    closeOnDateSelect,
    placeholder,
    size = FieldSize.Default,
}: FieldDateSelectRangeProps) {
    const [open, setOpen] = useState(false);

    const start = dayjs(startValue, NUMERIC_DATE_FORMAT, true).isValid() ? dayjs(startValue, NUMERIC_DATE_FORMAT).toDate() : null;
    const end = dayjs(endValue, NUMERIC_DATE_FORMAT, true).isValid() ? dayjs(endValue, NUMERIC_DATE_FORMAT).toDate() : null;

    const determineSelectedValue = (newDate: Date) => {
        const isBeforeStart = dayjs(newDate).isBefore(start, 'day');
        const isAfterEnd = dayjs(newDate).isAfter(end, 'day');

        if (!start && !end) return { start: dayjs(newDate).format(NUMERIC_DATE_FORMAT), end: '' };

        if (start && !end) {
            if (isBeforeStart) return { start: dayjs(newDate).format(NUMERIC_DATE_FORMAT), end: endValue };
            return { start: startValue, end: dayjs(newDate).format(NUMERIC_DATE_FORMAT) };
        } else if (start && end) {
            if (isBeforeStart) return { start: dayjs(newDate).format(NUMERIC_DATE_FORMAT), end: endValue };
            if (isAfterEnd) return { start: startValue, end: dayjs(newDate).format(NUMERIC_DATE_FORMAT) };
        }

        return { start: dayjs(newDate).format(NUMERIC_DATE_FORMAT), end: '' };
    };

    const handleDateSelect = (_year: number, _month: number, _day: number) => {
        const newDate = dayjs().year(_year).month(_month).date(_day).toDate();
        const toUpdate = determineSelectedValue(newDate);

        startOnChange({
            target: {
                value: toUpdate.start,
            },
        } as ChangeEvent<HTMLInputElement>);

        endOnChange({
            target: {
                value: toUpdate.end,
            },
        } as ChangeEvent<HTMLInputElement>);

        if (closeOnDateSelect && toUpdate.start !== '' && toUpdate.end !== '') {
            setOpen(false);
        }
    };

    const handleClose = () => setOpen(false);

    const containerRef = useRef<HTMLDivElement>(null);
    useOutsideClick(containerRef, open, handleClose);

    return (
        <div className="relative flex flex-row gap-10">
            <div className="w-full">
                <Field
                    value={startValue}
                    onChange={startOnChange}
                    formatOptions={{ format: '##/##/####' }}
                    label={startLabel}
                    endIcon={<CalendarIcon width={22} height={22} className="my-auto" onClick={() => setOpen(!open)} />}
                    type={FieldType.BaseActive}
                    placeholder={placeholder}
                    size={size}
                    variant={startVariant}
                    message={startMessage}
                />
            </div>
            <div className="w-full">
                <Field
                    value={endValue}
                    onChange={endOnChange}
                    formatOptions={{ format: '##/##/####' }}
                    label={endLabel}
                    endIcon={<CalendarIcon width={22} height={22} className="my-auto" onClick={() => setOpen(!open)} />}
                    type={FieldType.BaseActive}
                    placeholder={placeholder}
                    size={size}
                    variant={startValue === '' ? FieldVariant.Inactive : endVariant}
                    message={endMessage}
                />
            </div>
            <div className="absolute top-[88px] z-20 w-full rounded-md bg-white shadow-elevation-light-16" ref={containerRef}>
                <DatePicker open={open} date={{ start, end }} handleDateSelect={handleDateSelect} />
            </div>
        </div>
    );
}
