import dayjs, { Dayjs } from 'dayjs';
import localData from 'dayjs/plugin/localeData';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { ReactComponent as ArrowLeftMediumIcon } from '@deps/styles/elements/icons/icons_outlined/arrow-left-medium.svg';
import { ReactComponent as ArrowRightMediumIcon } from '@deps/styles/elements/icons/icons_outlined/arrow-right-medium.svg';

dayjs.extend(localData);

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
    isDateAllowed?: (dayjsDate: Dayjs) => boolean;
    datePickerType?: DatePickerTypes;
    showMonths?: boolean;
};

interface YearsProps {
    handleCloseYears: (year: number) => void;
    isRange: boolean | null;
    year: number;
    yearsOpen: boolean;
}

interface MonthsProps {
    handleCloseMonths: (month: number) => void;
    handleOpenYears: () => void;
    isRange: boolean | null;
    monthsOpen: boolean;
    setYear: Dispatch<SetStateAction<number>>;
    year: number;
}

interface CommonDayProps {
    daysOpen: boolean;
    getDisabledClasses: (_month: number, _day: number) => string;
    handleDateSelect: (_year: number, _month: number, _day: number) => void;
    handleMonthChange: (_month: number, delta: number) => void;
    handleOpenMonths: () => void;

    month: number;
    year: number;
}
interface DaysProps extends CommonDayProps {
    getSelectedClasses: (_month: number, _day: number) => string;
}

enum DatePickerDirection {
    start = 'start',
    end = 'end',
}

type QuartersProps = {
    setYear: Dispatch<SetStateAction<number>>;
    handleQuarterSelection: (_year: number, _quarter: Quarter) => void;
    handleYearSelection: (_year: number) => void;
    quartersOpen: boolean;
    getDisabledQuarterClasses: (_year: number, _quarter?: number, pickerDirection?: DatePickerDirection) => string;
    getSelectedQuarterClasses: (_month: number, _quarter: Quarter) => string;
    year: number;
    datePickerType: DatePickerTypes;
};

interface RangeDaysProps extends CommonDayProps {
    getSelectedRangeClasses: (_month: number, _day: number) => string;
}

// Primary classes are used for everything other than the short day names; secondary text is used for the short day names
const primaryTextClasses = 'font-primary font-semibold text-md leading-[21px] text-gray-900 whitespace-nowrap';
const secondaryTextClasses = 'font-secondary font-normal text-sm leading-4.5 text-gray-300 whitespace-nowrap';

// Used for the individual year, month, and day items on the panel
const hoverClasses = 'hover:border-accent1 hover:border-2';
const activeClasses = 'active:border-primary active:border-2 active:bg-primary-lightest';
const containerClasses = `${hoverClasses} ${activeClasses} cursor-pointer border-2 border-transparent rounded-lg p-2`;

export const getQuarter = (date: dayjs.Dayjs): number => {
    return Math.floor((date.month() + 3) / 3);
};

const Years = ({ handleCloseYears, isRange, year, yearsOpen }: YearsProps) => {
    const [yearsStart, setYearsStart] = useState(Math.floor(year / 10) * 10 - 1);
    const years = Array.from({ length: 12 }, (_, i) => yearsStart + i);

    if (!yearsOpen) return null;

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="align-center flex flex-row justify-between text-gray-900">
                <div className={containerClasses} onClick={() => setYearsStart(prev => prev - 10)}>
                    <ArrowLeftMediumIcon width={21} height={21} />
                </div>
                <div className={`${containerClasses} !pointer-events-none`}>
                    <p className={primaryTextClasses}>
                        {yearsStart} - {yearsStart + 11}
                    </p>
                </div>
                <div className={containerClasses} onClick={() => setYearsStart(prev => prev + 10)}>
                    <ArrowRightMediumIcon width={21} height={21} />
                </div>
            </div>
            <div className={`grid gap-6 ${isRange ? 'grid-cols-6' : 'grid-cols-4'}`}>
                {years.map((yearItem, index) => (
                    <div
                        key={index}
                        className={`${containerClasses} flex items-center justify-center `}
                        onClick={() => handleCloseYears(yearItem)}
                    >
                        <p className={primaryTextClasses}>{yearItem}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Months = ({ handleCloseMonths, handleOpenYears, isRange, monthsOpen, setYear, year }: MonthsProps) => {
    const months = dayjs.monthsShort();

    if (!monthsOpen) return null;

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-row justify-between text-gray-900">
                <div className={containerClasses} onClick={() => setYear(prev => prev - 1)}>
                    <ArrowLeftMediumIcon width={21} height={21} />
                </div>
                <div className={containerClasses} onClick={() => handleOpenYears()}>
                    <p className={`${primaryTextClasses} cursor-pointer`}>{year}</p>
                </div>
                <div className={containerClasses} onClick={() => setYear(prev => prev + 1)}>
                    <ArrowRightMediumIcon width={21} height={21} />
                </div>
            </div>
            <div className={`grid gap-6 ${isRange ? 'grid-cols-6' : 'grid-cols-4'}`}>
                {months.map((monthItem, index) => (
                    <div
                        key={index}
                        className={`${containerClasses} flex items-center justify-center`}
                        onClick={() => handleCloseMonths(index)}
                    >
                        <p className={primaryTextClasses}>{monthItem}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Days = ({
    daysOpen,
    getDisabledClasses,
    getSelectedClasses,
    handleDateSelect,
    handleMonthChange,
    handleOpenMonths,
    month,
    year,
}: DaysProps) => {
    // Used for the short day names at the top of the calendar
    const weekdays = dayjs.weekdaysShort();

    // Used to determine what weekday the month begins on
    const firstDayOfCurrentMonth = dayjs().year(year).month(month).date(1).day();

    // Used to determine how many days from the current month to display
    const currentMonth = dayjs().year(year).month(month).month();
    const daysInCurrentMonth = dayjs().year(year).month(month).daysInMonth();
    const daysOfCurrentMonth = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);

    // Used to determine how many days from the previous month to display
    const previousMonth = dayjs().year(year).month(currentMonth).subtract(1, 'month').month();
    const daysInPreviousMonth = dayjs().year(year).month(month).subtract(1, 'month').daysInMonth();
    const daysOfPreviousMonth = Array.from({ length: firstDayOfCurrentMonth }, (_, i) => daysInPreviousMonth - i).sort();

    // Used to determine how many days from the next month to display
    const nextMonth = dayjs().year(year).month(currentMonth).add(1, 'month').month();
    const daysInNextMonth =
        (daysOfPreviousMonth.length + daysInCurrentMonth) % 7 === 0 ? 0 : 7 - ((daysOfPreviousMonth.length + daysInCurrentMonth) % 7);
    const daysOfNextMonth = Array.from({ length: daysInNextMonth }, (_, i) => i + 1);

    if (!daysOpen) return null;

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-row justify-between text-gray-900">
                <div className={containerClasses} onClick={() => handleMonthChange(month, -1)}>
                    <ArrowLeftMediumIcon width={21} height={21} />
                </div>
                <div className={containerClasses} onClick={() => handleOpenMonths()}>
                    <p className={`${primaryTextClasses} cursor-pointer`}>{`${dayjs.months()[month]} ${year}`}</p>
                </div>
                <div className={containerClasses} onClick={() => handleMonthChange(month, 1)}>
                    <ArrowRightMediumIcon width={21} height={21} />
                </div>
            </div>
            <div className="grid grid-cols-7">
                {weekdays.map((dayItem, index) => (
                    <div key={index} className="flex items-center justify-center">
                        <p className={secondaryTextClasses}>{dayItem}</p>
                    </div>
                ))}
                {daysOfPreviousMonth.map((dayItem, index) => (
                    <div
                        key={index}
                        className={`${containerClasses} ${getSelectedClasses(previousMonth, dayItem)} ${getDisabledClasses(
                            previousMonth,
                            dayItem
                        )} flex items-center justify-center`}
                        onClick={() => handleDateSelect(year, previousMonth, dayItem)}
                    >
                        <p className={`${primaryTextClasses} ${getDisabledClasses(previousMonth, dayItem)}`}>{dayItem}</p>
                    </div>
                ))}
                {daysOfCurrentMonth.map((dayItem, index) => (
                    <div
                        key={index}
                        className={`${containerClasses} ${getSelectedClasses(month, dayItem)} ${getDisabledClasses(
                            month,
                            dayItem
                        )} flex items-center justify-center`}
                        onClick={() => handleDateSelect(year, month, dayItem)}
                    >
                        <p className={`${primaryTextClasses} ${getDisabledClasses(month, dayItem)}`}>{dayItem}</p>
                    </div>
                ))}
                {daysOfNextMonth.map((dayItem, index) => (
                    <div
                        key={index}
                        className={`${containerClasses} ${getSelectedClasses(nextMonth, dayItem)} ${getDisabledClasses(
                            nextMonth,
                            dayItem
                        )} flex items-center justify-center`}
                        onClick={() => handleDateSelect(year, nextMonth, dayItem)}
                    >
                        <p className={`${primaryTextClasses} ${getDisabledClasses(nextMonth, dayItem)}`}>{dayItem}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Quarters = ({
    quartersOpen,
    getDisabledQuarterClasses,
    getSelectedQuarterClasses,
    handleQuarterSelection,
    handleYearSelection,
    year,
    setYear,
    datePickerType,
}: QuartersProps) => {
    // Used to determine what weekday the month begins on
    const disableQuarters = datePickerType === DatePickerTypes.Annually ? '!cursor-auto !pointer-events-none !text-gray-300' : '';
    if (!quartersOpen) return null;

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-row justify-between text-gray-900">
                <div
                    className={`${containerClasses} ${getDisabledQuarterClasses(year, undefined, DatePickerDirection.start)}`}
                    onClick={() => setYear(prev => prev - 1)}
                >
                    <ArrowLeftMediumIcon width={21} height={21} />
                </div>
                <div className={containerClasses} onClick={() => handleYearSelection(year)}>
                    <p className={`${primaryTextClasses} cursor-pointer`}>{`${year}`}</p>
                </div>
                <div
                    className={`${containerClasses} ${getDisabledQuarterClasses(year, undefined, DatePickerDirection.end)}`}
                    onClick={() => setYear(prev => prev + 1)}
                >
                    <ArrowRightMediumIcon width={21} height={21} />
                </div>
            </div>
            <div className="grid grid-cols-4">
                {quarters.map((quarterItem, index) => {
                    return (
                        <div
                            key={index}
                            className={`${containerClasses} ${getSelectedQuarterClasses(
                                year,
                                quarterItem?.value
                            )} ${getDisabledQuarterClasses(
                                year,
                                quarterItem.month + 1,
                                DatePickerDirection.start
                            )} ${disableQuarters}  flex items-center justify-center`}
                            onClick={() => handleQuarterSelection(year, quarterItem?.value)}
                        >
                            <p
                                className={`${primaryTextClasses} ${getDisabledQuarterClasses(
                                    year,
                                    quarterItem.month + 1,
                                    DatePickerDirection.start
                                )} ${disableQuarters} `}
                            >
                                {quarterItem.label}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const RangeDays = ({
    daysOpen,
    getDisabledClasses,
    getSelectedRangeClasses,
    handleDateSelect,
    handleMonthChange,
    handleOpenMonths,
    month,
    year,
}: RangeDaysProps) => {
    // Used for the short day names at the top of the calendar
    const weekdays = dayjs.weekdaysShort();

    // Used to determine what weekday the month begins on
    const firstDayOfFirstMonth = dayjs().year(year).month(month).date(1).day();
    const firstDayOfSecondMonth = dayjs()
        .year(year)
        .month(month + 1)
        .date(1)
        .day();

    // Used to determine how many days from the current month to display
    const daysInFirstMonth = dayjs().year(year).month(month).daysInMonth();
    const daysOfFirstMonth = Array.from({ length: daysInFirstMonth }, (_, i) => i + 1);
    const firstMonthStartBuffer = Array.from({ length: firstDayOfFirstMonth }, (_, i) => i + 1);

    const daysInSecondMonth = dayjs()
        .year(year)
        .month(month + 1)
        .daysInMonth();
    const daysOfSecondMonth = Array.from({ length: daysInSecondMonth }, (_, i) => i + 1);
    const secondMonthStartBuffer = Array.from({ length: firstDayOfSecondMonth }, (_, i) => i + 1);

    const secondMonth = month + 1 === 12 ? 0 : month + 1;
    const secondYear = month + 1 === 12 ? year + 1 : year;

    if (!daysOpen) return null;

    return (
        <div className="flex flex-row">
            <div className="flex flex-col gap-4 p-4 pr-2">
                <div className="flex flex-row justify-between text-gray-900">
                    <div className={containerClasses} onClick={() => handleMonthChange(month, -1)}>
                        <ArrowLeftMediumIcon width={21} height={21} />
                    </div>
                    <div className={containerClasses} onClick={() => handleOpenMonths()}>
                        <p className={`${primaryTextClasses} cursor-pointer`}>{`${dayjs.months()[month]} ${year}`}</p>
                    </div>
                    <div className={`${containerClasses} invisible`}>
                        <ArrowRightMediumIcon width={21} height={21} />
                    </div>
                </div>
                <div className="grid grid-cols-7">
                    {weekdays.map((dayItem, index) => (
                        <div key={index} className="flex items-center justify-center">
                            <p className={secondaryTextClasses}>{dayItem}</p>
                        </div>
                    ))}
                    {firstMonthStartBuffer.map(index => (
                        <div key={index} className="flex items-center justify-center" />
                    ))}
                    {daysOfFirstMonth.map((dayItem, index) => (
                        <div
                            key={index}
                            className={`${containerClasses} ${getSelectedRangeClasses(month, dayItem)} ${getDisabledClasses(
                                month,
                                dayItem
                            )} flex items-center justify-center`}
                            onClick={() => handleDateSelect(year, month, dayItem)}
                        >
                            <p className={`${primaryTextClasses} ${getDisabledClasses(month, dayItem)}`}>{dayItem}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-4 p-4 pl-2">
                <div className="flex flex-row justify-between text-gray-900">
                    <div className={`${containerClasses} invisible`}>
                        <ArrowLeftMediumIcon width={21} height={21} />
                    </div>
                    <div className={containerClasses} onClick={() => handleOpenMonths()}>
                        <p className={`${primaryTextClasses} cursor-pointer`}>{`${dayjs.months()[secondMonth]} ${secondYear}`}</p>
                    </div>
                    <div className={containerClasses} onClick={() => handleMonthChange(month, 1)}>
                        <ArrowRightMediumIcon width={21} height={21} />
                    </div>
                </div>
                <div className="grid grid-cols-7">
                    {weekdays.map((dayItem, index) => (
                        <div key={index} className="flex items-center justify-center">
                            <p className={secondaryTextClasses}>{dayItem}</p>
                        </div>
                    ))}
                    {secondMonthStartBuffer.map(index => (
                        <div key={index} className="flex items-center justify-center" />
                    ))}
                    {daysOfSecondMonth.map((dayItem, index) => (
                        <div
                            key={index}
                            className={`${containerClasses} ${getSelectedRangeClasses(month + 1, dayItem)} ${getDisabledClasses(
                                month + 1,
                                dayItem
                            )} flex items-center justify-center`}
                            onClick={() => handleDateSelect(year, month + 1, dayItem)}
                        >
                            <p className={`${primaryTextClasses} ${getDisabledClasses(month + 1, dayItem)}`}>{dayItem}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function DatePicker({
    open,
    date,
    handleDateSelect,
    isFutureDateDisabled = true,
    isDateAllowed = () => true,
    datePickerType,
    handleCustomSelection,
    showMonths = true,
}: DatePickerProps) {
    const isRange = date && 'start' in date && 'end' in date;
    const [currentDate] = useState(() => {
        if (date === null) return dayjs().toDate();
        if (isRange && date.start instanceof Date) return dayjs(date.start).toDate();
        if (date instanceof Date) return dayjs(date).toDate();

        return dayjs().toDate();
    });

    useEffect(() => {
        setYear(currentDate.getFullYear());
        setMonth(currentDate.getMonth());
    }, [currentDate]);

    // Used to control navigation between years, months, and days panels
    const [daysOpen, setDaysOpen] = useState(true);
    const [monthsOpen, setMonthsOpen] = useState(false);
    const [yearsOpen, setYearsOpen] = useState(false);

    // Used to the month and year that is displayed on the panels
    const [year, setYear] = useState(currentDate.getFullYear());
    const [month, setMonth] = useState(currentDate.getMonth());

    // When the user clicks on the heading of the months panel, the years panel will open and the months and years state will update accordingly
    const handleOpenYears = () => {
        setMonthsOpen(false);
        setYearsOpen(true);
    };

    // When the user clicks on a year within the years panel, the months panel will open and the months and years state will update accordingly
    const handleCloseYears = (year: number) => {
        setYear(year);
        setYearsOpen(false);
        setMonthsOpen(true);
    };

    // When the user clicks on the heading of the days panel, the months panel will open and the months and days state will update accordingly
    const handleOpenMonths = () => {
        setDaysOpen(false);
        setMonthsOpen(true);
    };

    // When the user clicks on a month within the months panel, the days panel will open and the months and days state will update accordingly
    const handleCloseMonths = (month: number) => {
        setMonth(month);
        setMonthsOpen(false);
        setDaysOpen(true);
    };

    // When the user navigates to the previous or next month, we must check if the year has also changed before setting the month and year state
    const handleMonthChange = (_month: number, delta: number) => {
        if (month + delta < 0) {
            setYear(prev => prev - 1);
            setMonth(11);
            return;
        }

        if (month + delta > 11) {
            setYear(prev => prev + 1);
            setMonth(0);
            return;
        }

        setMonth(prev => prev + delta);
    };

    const getDisabledClasses = (_month: number, _day: number) => {
        const disabledClasses = '!cursor-auto !pointer-events-none !text-gray-300';
        const dayjsDate = dayjs().year(year).month(_month).date(_day);
        const dateAllowed = isDateAllowed(dayjsDate);
        if (!dateAllowed) {
            return disabledClasses;
        }
        // Disables future dates
        if (isFutureDateDisabled && dayjsDate.isAfter(dayjs(), 'day')) {
            return disabledClasses;
        }
        return '';
    };

    const getDisabledQuarterClasses = (_year: number, _quarter?: number, pickerDirection?: DatePickerDirection) => {
        const today = dayjs();
        const { year, quarter } = { year: today.year(), quarter: getQuarter(today) };

        const disabledQuarter = _quarter ? quarter <= _quarter : true;
        const disabledYear = _year >= year;

        const isCurrentDateAllowed = isDateAllowed(
            dayjs()
                .year(_year)
                .month(_quarter ?? 1)
                .date(1)
        );

        const disabledClasses = '!cursor-auto !pointer-events-none !text-gray-300';

        if (!isCurrentDateAllowed && pickerDirection === DatePickerDirection.start) {
            return disabledClasses;
        }
        if (pickerDirection === DatePickerDirection.end && disabledYear && disabledQuarter) return disabledClasses;

        return '';
    };

    const getSelectedClasses = (_month: number, _day: number) => {
        const selectedClasses = '!border-primary border-2 bg-primary-lightest';

        if (!date) return '';
        const selectedDay = (date as Date).getDate();
        const selectedMonth = (date as Date).getMonth();
        const selectedYear = (date as Date).getFullYear();
        if (selectedDay === _day && selectedMonth === _month && selectedYear === year) return selectedClasses;

        return '';
    };

    const getSelectedQuarterClasses = (_year: number, _quarter: Quarter | null) => {
        const selectedClasses = '!border-primary border-2 bg-primary-lightest';
        if (!date) return '';
        const { year, quarter } = date as DateQuarter;

        if (year === _year && quarter === _quarter) return selectedClasses;
        return '';
    };

    const getSelectedRangeClasses = (_month: number, _day: number) => {
        const selectedClasses = '!border-primary border-2 bg-primary-lightest';
        const rangeClasses = 'bg-primary-lightest';

        const current = dayjs().year(year).month(_month).date(_day);

        if (!date || !(date as DateRange).start) return '';
        const selectedStartDay = ((date as DateRange).start as Date).getDate();
        const selectedStartMonth = ((date as DateRange).start as Date).getMonth();
        const selectedStartYear = ((date as DateRange).start as Date).getFullYear();
        if (selectedStartDay === _day && selectedStartMonth === _month && selectedStartYear === year) return selectedClasses;

        if (!date || !(date as DateRange).end) return '';
        const selectedEndDay = ((date as DateRange).end as Date).getDate();
        const selectedEndMonth = ((date as DateRange).end as Date).getMonth();
        const selectedEndYear = ((date as DateRange).end as Date).getFullYear();
        if (selectedEndDay === _day && selectedEndMonth === _month && selectedEndYear === year) return selectedClasses;

        const start = dayjs().year(selectedStartYear).month(selectedStartMonth).date(selectedStartDay);
        const end = dayjs().year(selectedEndYear).month(selectedEndMonth).date(selectedEndDay);
        if (current.isAfter(start) && current.isBefore(end)) return rangeClasses;

        return '';
    };

    const handleYearSelection = (year: number) => {
        if (datePickerType === DatePickerTypes.Quarterly) return;
        handleCustomSelection && handleCustomSelection(year);
    };

    if (!open) return null;

    return (
        <div>
            <Years handleCloseYears={handleCloseYears} isRange={isRange} year={year} yearsOpen={yearsOpen} />
            {showMonths && (
                <Months
                    handleCloseMonths={handleCloseMonths}
                    handleOpenYears={handleOpenYears}
                    isRange={isRange}
                    monthsOpen={monthsOpen}
                    setYear={setYear}
                    year={year}
                />
            )}
            {!isRange &&
                handleCustomSelection &&
                datePickerType &&
                [DatePickerTypes.Annually, DatePickerTypes.Quarterly].includes(datePickerType) ? (
                <Quarters
                    quartersOpen={daysOpen}
                    getDisabledQuarterClasses={getDisabledQuarterClasses}
                    getSelectedQuarterClasses={getSelectedQuarterClasses}
                    handleQuarterSelection={handleCustomSelection}
                    handleYearSelection={handleYearSelection}
                    setYear={setYear}
                    year={year}
                    datePickerType={datePickerType}
                />
            ) : isRange ? (
                <RangeDays
                    daysOpen={daysOpen}
                    getDisabledClasses={getDisabledClasses}
                    getSelectedRangeClasses={getSelectedRangeClasses}
                    handleDateSelect={handleDateSelect}
                    handleMonthChange={handleMonthChange}
                    handleOpenMonths={handleOpenMonths}
                    month={month}
                    year={year}
                />
            ) : (
                <Days
                    daysOpen={daysOpen}
                    getDisabledClasses={getDisabledClasses}
                    getSelectedClasses={getSelectedClasses}
                    handleDateSelect={handleDateSelect}
                    handleMonthChange={handleMonthChange}
                    handleOpenMonths={handleOpenMonths}
                    month={month}
                    year={year}
                />
            )}
        </div>
    );
}
