import { Dayjs } from 'dayjs';

export type DateRange = {
    start: Date | null;
    end: Date | null;
};

export type DateQuarter = {
    year: number | null;
    quarter: Quarter | null;
};

export enum DatePickerTypes {
    Quarterly = 'Quarterly',
    Annually = 'Annually',
}

export enum Quarter {
    Q1 = 'Q1',
    Q2 = 'Q2',
    Q3 = 'Q3',
    Q4 = 'Q4',
}

export const quarters = [
    { label: Quarter.Q1, value: Quarter.Q1, month: 1 },
    { label: Quarter.Q2, value: Quarter.Q2, month: 4 },
    { label: Quarter.Q3, value: Quarter.Q3, month: 7 },
    { label: Quarter.Q4, value: Quarter.Q4, month: 10 },
];

export type DatePickerProps = {
    open: boolean;
    date: Date | DateRange | DateQuarter | null;
    handleDateSelect: (_year: number, _month: number, _day: number) => void;
    handleCustomSelection?: (_year: number, _quarter?: Quarter) => void;
    isFutureDateDisabled?: boolean;
    isPastDateDisabled?: boolean;
    isDateAllowed?: (dayjsDate: Dayjs) => boolean;
    datePickerType?: DatePickerTypes;
    showMonths?: boolean;
    /** Callback when the user presses the Tab key to exit the date picker */
    onTab?: () => void;
    /** Callback when the user presses the Escape key to close the date picker */
    onEscape?: () => void;
};

export const getQuarter = (date: Dayjs): number => {
    return Math.floor((date.month() + 3) / 3);
};
