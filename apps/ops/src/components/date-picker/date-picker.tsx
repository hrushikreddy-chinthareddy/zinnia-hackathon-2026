import dayjs from 'dayjs';
import localData from 'dayjs/plugin/localeData';
import { useEffect, useState } from 'react';

import { Days } from './components/days';
import { Months } from './components/months';
import { Quarters } from './components/quarters';
import { RangeDays } from './components/range-days';
import { Years } from './components/years';
import {
    DatePickerProps,
    DatePickerTypes,
    DateQuarter,
    DateRange,
    getQuarter,
    Quarter,
} from './types';

export * from './types';

dayjs.extend(localData);

enum DatePickerDirection {
    start = 'start',
    end = 'end',
}

export default function DatePicker({
    open,
    date,
    handleDateSelect,
    isFutureDateDisabled = true,
    isPastDateDisabled = false,
    isDateAllowed = () => true,
    datePickerType,
    handleCustomSelection,
    showMonths = true,
    onTab,
    onEscape,
}: DatePickerProps) {
    const isRange = date && 'start' in date && 'end' in date;
    const [currentDate] = useState(() => {
        if (date === null) return dayjs().toDate();
        if (isRange && date.start instanceof Date)
            return dayjs(date.start).toDate();
        if (isRange && typeof date.start === 'string')
            return dayjs(date.start).toDate();
        if (date instanceof Date) return dayjs(date).toDate();
        if (typeof date === 'string') return dayjs(date).toDate();

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

    // Escape key handlers for keyboard navigation
    const handleEscapeFromYears = () => {
        setYearsOpen(false);
        setMonthsOpen(true);
    };

    const handleEscapeFromMonths = () => {
        setMonthsOpen(false);
        setDaysOpen(true);
    };

    const handleEscapeFromDays = () => {
        // If showMonths is true, navigate to months view
        // Otherwise, close the entire picker
        if (showMonths) {
            setDaysOpen(false);
            setMonthsOpen(true);
        } else if (onEscape) {
            onEscape();
        }
    };

    const handleEscapeFromQuarters = () => {
        // Close the entire picker when escaping from quarters view
        if (onEscape) {
            onEscape();
        }
    };

    // When the user navigates to the previous or next month, we must check if the year has also changed before setting the month and year state
    const handleMonthChange = (_month: number, delta: number) => {
        if (month + delta < 0) {
            setYear((prev) => prev - 1);
            setMonth(11);
            return;
        }

        if (month + delta > 11) {
            setYear((prev) => prev + 1);
            setMonth(0);
            return;
        }

        setMonth((prev) => prev + delta);
    };

    const getDisabledClasses = (_month: number, _day: number) => {
        const disabledClasses =
            '!cursor-auto !pointer-events-none !text-gray-300';
        const dayjsDate = dayjs()
            .year(year)
            .month(_month)
            .date(_day)
            .startOf('day');
        const dateAllowed = isDateAllowed(dayjsDate);

        if (!dateAllowed) {
            return disabledClasses;
        }

        if (
            (isPastDateDisabled && dayjsDate.isBefore(dayjs(), 'day')) ||
            (isFutureDateDisabled && dayjsDate.isAfter(dayjs(), 'day'))
        ) {
            return disabledClasses;
        }
        return '';
    };

    const getDisabledQuarterClasses = (
        _year: number,
        _quarter?: number,
        pickerDirection?: DatePickerDirection
    ) => {
        const today = dayjs();
        const { year, quarter } = {
            year: today.year(),
            quarter: getQuarter(today),
        };

        const disabledQuarter = _quarter ? quarter <= _quarter : true;
        const disabledYear = _year >= year;

        const isCurrentDateAllowed = isDateAllowed(
            dayjs()
                .year(_year)
                .month(_quarter ?? 1)
                .date(1)
        );

        const disabledClasses =
            '!cursor-auto !pointer-events-none !text-gray-300';

        if (
            !isCurrentDateAllowed &&
            pickerDirection === DatePickerDirection.start
        ) {
            return disabledClasses;
        }
        if (
            pickerDirection === DatePickerDirection.end &&
            disabledYear &&
            disabledQuarter
        )
            return disabledClasses;

        return '';
    };

    const getSelectedClasses = (_month: number, _day: number) => {
        const selectedClasses = '!border-primary border-2 bg-primary-lightest';

        if (!date) return '';
        const selectedDay = (date as Date).getDate();
        const selectedMonth = (date as Date).getMonth();
        const selectedYear = (date as Date).getFullYear();
        if (
            selectedDay === _day &&
            selectedMonth === _month &&
            selectedYear === year
        )
            return selectedClasses;

        return '';
    };

    const getSelectedQuarterClasses = (
        _year: number,
        _quarter: Quarter | null
    ) => {
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
        const selectedStartMonth = (
            (date as DateRange).start as Date
        ).getMonth();
        const selectedStartYear = (
            (date as DateRange).start as Date
        ).getFullYear();
        if (
            selectedStartDay === _day &&
            selectedStartMonth === _month &&
            selectedStartYear === year
        )
            return selectedClasses;

        if (!date || !(date as DateRange).end) return '';
        const selectedEndDay = ((date as DateRange).end as Date).getDate();
        const selectedEndMonth = ((date as DateRange).end as Date).getMonth();
        const selectedEndYear = ((date as DateRange).end as Date).getFullYear();
        if (
            selectedEndDay === _day &&
            selectedEndMonth === _month &&
            selectedEndYear === year
        )
            return selectedClasses;

        const start = dayjs()
            .year(selectedStartYear)
            .month(selectedStartMonth)
            .date(selectedStartDay);
        const end = dayjs()
            .year(selectedEndYear)
            .month(selectedEndMonth)
            .date(selectedEndDay);
        if (current.isAfter(start) && current.isBefore(end))
            return rangeClasses;

        return '';
    };

    const handleYearSelection = (year: number) => {
        if (datePickerType === DatePickerTypes.Quarterly) return;
        handleCustomSelection && handleCustomSelection(year);
    };

    if (!open) return null;

    return (
        <div>
            <Years
                handleCloseYears={handleCloseYears}
                isRange={isRange}
                year={year}
                yearsOpen={yearsOpen}
                onEscape={handleEscapeFromYears}
            />
            {showMonths && (
                <Months
                    handleCloseMonths={handleCloseMonths}
                    handleOpenYears={handleOpenYears}
                    isRange={isRange}
                    monthsOpen={monthsOpen}
                    setYear={setYear}
                    year={year}
                    onEscape={handleEscapeFromMonths}
                />
            )}
            {!isRange &&
            handleCustomSelection &&
            datePickerType &&
            [DatePickerTypes.Annually, DatePickerTypes.Quarterly].includes(
                datePickerType
            ) ? (
                <Quarters
                    quartersOpen={daysOpen}
                    getDisabledQuarterClasses={getDisabledQuarterClasses}
                    getSelectedQuarterClasses={getSelectedQuarterClasses}
                    handleQuarterSelection={handleCustomSelection}
                    handleYearSelection={handleYearSelection}
                    setYear={setYear}
                    year={year}
                    datePickerType={datePickerType}
                    onEscape={handleEscapeFromQuarters}
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
                    onEscape={handleEscapeFromDays}
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
                    onEscape={handleEscapeFromDays}
                    onTab={onTab}
                />
            )}
        </div>
    );
}
