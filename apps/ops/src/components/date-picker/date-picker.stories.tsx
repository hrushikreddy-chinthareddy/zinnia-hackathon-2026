import '@deps/styles/styles.css';
import { Meta } from '@storybook/react';
import dayjs from 'dayjs';
import { useState } from 'react';

import DatePicker, { DateRange } from './date-picker';

export default {
    title: 'Components/DatePicker',
    component: DatePicker,
    decorators: [
        Story => (
            <div className="p-10">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof DatePicker>;

export const DatePickerDefault = () => {
    const [open] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const handleDateSelect = (_year: number, _month: number, _day: number) => {
        setSelectedDate(dayjs().year(_year).month(_month).date(_day).toDate());
    };

    return (
        <div className="w-[300px]">
            <DatePicker open={open} date={selectedDate} handleDateSelect={handleDateSelect} />
        </div>
    );
};

export const DatePickerRange = () => {
    const [open] = useState(true);
    const [selectedRange, setSelectedRange] = useState({ start: null, end: null } as DateRange);

    const handleDateSelect = (_year: number, _month: number, _day: number) => {
        const newDate = dayjs().year(_year).month(_month).date(_day).toDate();
        const { start, end } = selectedRange;

        const isBeforeStart = dayjs(newDate).isBefore(start, 'day');
        const isAfterEnd = dayjs(newDate).isAfter(end, 'day');
        const isSameAsStart = dayjs(newDate).isSame(start, 'day');
        const isSameAsEnd = dayjs(newDate).isSame(end, 'day');

        if (!start && !end) {
            setSelectedRange({ start: newDate, end: null });
        } else if (start && !end) {
            if (isBeforeStart) {
                setSelectedRange({ start: newDate, end: null });
            } else {
                setSelectedRange({ start: start, end: newDate });
            }
        } else if (start && end) {
            if (isSameAsStart || isSameAsEnd) {
                setSelectedRange({ start: newDate, end: null });
            } else if (isBeforeStart) {
                setSelectedRange({ start: newDate, end: end });
            } else if (isAfterEnd) {
                setSelectedRange({ start: start, end: newDate });
            } else {
                setSelectedRange({ start: newDate, end: null });
            }
        }
    };

    return (
        <div className="w-[612px]">
            <DatePicker open={open} date={selectedRange} handleDateSelect={handleDateSelect} />
        </div>
    );
};
