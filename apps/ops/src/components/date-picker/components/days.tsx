import dayjs from 'dayjs';
import { useCallback, useMemo } from 'react';

import { ReactComponent as ArrowLeftMediumIcon } from '@deps/styles/elements/icons/icons_outlined/arrow-left-medium.svg';
import { ReactComponent as ArrowRightMediumIcon } from '@deps/styles/elements/icons/icons_outlined/arrow-right-medium.svg';

import { useKeyboardNavigation } from '../useKeyboardNavigation';
import {
    createClickHandler,
    createKeyDownHandler,
    getTabIndex,
    primaryTextClasses,
    secondaryTextClasses,
    containerClasses,
} from '../utils';

interface DaysProps {
    daysOpen: boolean;
    getDisabledClasses: (_month: number, _day: number) => string;
    getSelectedClasses: (_month: number, _day: number) => string;
    handleDateSelect: (_year: number, _month: number, _day: number) => void;
    handleMonthChange: (_month: number, delta: number) => void;
    handleOpenMonths: () => void;
    month: number;
    year: number;
    onEscape?: () => void;
    onTab?: () => void;
}

export const Days = ({
    daysOpen,
    getDisabledClasses,
    getSelectedClasses,
    handleDateSelect,
    handleMonthChange,
    handleOpenMonths,
    month,
    year,
    onEscape,
    onTab,
}: DaysProps) => {
    const weekdays = dayjs.weekdaysShort();
    const firstDayOfCurrentMonth = dayjs()
        .year(year)
        .month(month)
        .date(1)
        .day();

    const currentMonth = dayjs().year(year).month(month).month();
    const daysInCurrentMonth = dayjs().year(year).month(month).daysInMonth();
    const daysOfCurrentMonth = Array.from(
        { length: daysInCurrentMonth },
        (_, i) => i + 1
    );

    const previousMonth = dayjs()
        .year(year)
        .month(currentMonth)
        .subtract(1, 'month')
        .month();
    const daysInPreviousMonth = dayjs()
        .year(year)
        .month(month)
        .subtract(1, 'month')
        .daysInMonth();
    const daysOfPreviousMonth = Array.from(
        { length: firstDayOfCurrentMonth },
        (_, i) => daysInPreviousMonth - i
    ).sort();

    const nextMonth = dayjs()
        .year(year)
        .month(currentMonth)
        .add(1, 'month')
        .month();
    const daysInNextMonth =
        (daysOfPreviousMonth.length + daysInCurrentMonth) % 7 === 0
            ? 0
            : 7 - ((daysOfPreviousMonth.length + daysInCurrentMonth) % 7);
    const daysOfNextMonth = Array.from(
        { length: daysInNextMonth },
        (_, i) => i + 1
    );

    const allDays = useMemo(
        () => [
            ...daysOfPreviousMonth.map((day, idx) => ({
                day,
                month: previousMonth,
                year: month === 0 ? year - 1 : year,
                type: 'previous',
                originalIndex: idx,
            })),
            ...daysOfCurrentMonth.map((day, idx) => ({
                day,
                month,
                year,
                type: 'current',
                originalIndex: idx,
            })),
            ...daysOfNextMonth.map((day, idx) => ({
                day,
                month: nextMonth,
                year: month === 11 ? year + 1 : year,
                type: 'next',
                originalIndex: idx,
            })),
        ],
        [
            daysOfPreviousMonth,
            daysOfCurrentMonth,
            daysOfNextMonth,
            previousMonth,
            month,
            year,
            nextMonth,
        ]
    );

    const isIndexDisabled = useCallback(
        (index: number) => {
            const dayData = allDays[index];
            return getDisabledClasses(dayData.month, dayData.day).includes(
                'pointer-events-none'
            );
        },
        [allDays, getDisabledClasses]
    );

    const { focusedIndex, setItemRef, handleKeyDown } = useKeyboardNavigation(
        allDays.length,
        7,
        (index) => {
            const dayData = allDays[index];
            handleDateSelect(dayData.year, dayData.month, dayData.day);
        },
        onEscape,
        isIndexDisabled,
        0
    );

    if (!daysOpen) return null;

    return (
        <div className="flex flex-col gap-4 p-4" onKeyDown={handleKeyDown}>
            <div className="flex flex-row justify-between text-gray-900">
                <button
                    className={containerClasses}
                    onClick={createClickHandler(() =>
                        handleMonthChange(month, -1)
                    )}
                    onKeyDown={createKeyDownHandler(() =>
                        handleMonthChange(month, -1)
                    )}
                    aria-label="Previous month"
                >
                    <ArrowLeftMediumIcon width={21} height={21} />
                </button>
                <button
                    className={containerClasses}
                    onClick={createClickHandler(() => handleOpenMonths())}
                    onKeyDown={createKeyDownHandler(() => handleOpenMonths())}
                    aria-label={`${
                        dayjs.months()[month]
                    } ${year}, click to select month`}
                >
                    <p className={`${primaryTextClasses} cursor-pointer`}>{`${
                        dayjs.months()[month]
                    } ${year}`}</p>
                </button>
                <button
                    className={containerClasses}
                    onClick={createClickHandler(() =>
                        handleMonthChange(month, 1)
                    )}
                    onKeyDown={createKeyDownHandler(() =>
                        handleMonthChange(month, 1)
                    )}
                    aria-label="Next month"
                >
                    <ArrowRightMediumIcon width={21} height={21} />
                </button>
            </div>
            <div className="grid grid-cols-7" role="grid" aria-label="Calendar">
                {weekdays.map((dayItem, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-center"
                        role="columnheader"
                    >
                        <p className={secondaryTextClasses}>{dayItem}</p>
                    </div>
                ))}
                {daysOfPreviousMonth.map((dayItem, index) => {
                    const globalIndex = index;
                    const isDisabled = getDisabledClasses(
                        previousMonth,
                        dayItem
                    ).includes('pointer-events-none');
                    return (
                        <button
                            key={`prev-${index}`}
                            ref={setItemRef(globalIndex)}
                            className={`${containerClasses} ${getSelectedClasses(
                                previousMonth,
                                dayItem
                            )} ${getDisabledClasses(
                                previousMonth,
                                dayItem
                            )} flex items-center justify-center focus:ring-2 focus:ring-primary focus:ring-offset-2`}
                            onClick={createClickHandler(() =>
                                handleDateSelect(year, previousMonth, dayItem)
                            )}
                            onKeyDown={(e) => {
                                if (e.key === 'Tab' && !e.shiftKey && onTab) {
                                    onTab();
                                }
                            }}
                            tabIndex={getTabIndex(
                                isDisabled,
                                globalIndex === focusedIndex
                            )}
                            role="gridcell"
                            aria-label={`${dayItem} ${
                                dayjs.monthsShort()[previousMonth]
                            }`}
                            aria-disabled={isDisabled}
                        >
                            <p
                                className={`${primaryTextClasses} ${getDisabledClasses(
                                    previousMonth,
                                    dayItem
                                )}`}
                            >
                                {dayItem}
                            </p>
                        </button>
                    );
                })}
                {daysOfCurrentMonth.map((dayItem, index) => {
                    const globalIndex = daysOfPreviousMonth.length + index;
                    const isDisabled = getDisabledClasses(
                        month,
                        dayItem
                    ).includes('pointer-events-none');
                    return (
                        <button
                            key={`current-${index}`}
                            ref={setItemRef(globalIndex)}
                            className={`${containerClasses} ${getSelectedClasses(
                                month,
                                dayItem
                            )} ${getDisabledClasses(
                                month,
                                dayItem
                            )} flex items-center justify-center focus:ring-2 focus:ring-primary focus:ring-offset-2`}
                            onClick={createClickHandler(() =>
                                handleDateSelect(year, month, dayItem)
                            )}
                            onKeyDown={(e) => {
                                if (e.key === 'Tab' && !e.shiftKey && onTab) {
                                    onTab();
                                }
                            }}
                            tabIndex={getTabIndex(
                                isDisabled,
                                globalIndex === focusedIndex
                            )}
                            role="gridcell"
                            aria-label={`${dayItem} ${
                                dayjs.monthsShort()[month]
                            }`}
                            aria-disabled={isDisabled}
                        >
                            <p
                                className={`${primaryTextClasses} ${getDisabledClasses(
                                    month,
                                    dayItem
                                )}`}
                            >
                                {dayItem}
                            </p>
                        </button>
                    );
                })}
                {daysOfNextMonth.map((dayItem, index) => {
                    const globalIndex =
                        daysOfPreviousMonth.length +
                        daysOfCurrentMonth.length +
                        index;
                    const isDisabled = getDisabledClasses(
                        nextMonth,
                        dayItem
                    ).includes('pointer-events-none');
                    return (
                        <button
                            key={`next-${index}`}
                            ref={setItemRef(globalIndex)}
                            className={`${containerClasses} ${getSelectedClasses(
                                nextMonth,
                                dayItem
                            )} ${getDisabledClasses(
                                nextMonth,
                                dayItem
                            )} flex items-center justify-center focus:ring-2 focus:ring-primary focus:ring-offset-2`}
                            onClick={createClickHandler(() =>
                                handleDateSelect(year, nextMonth, dayItem)
                            )}
                            onKeyDown={(e) => {
                                if (e.key === 'Tab' && !e.shiftKey && onTab) {
                                    onTab();
                                }
                            }}
                            tabIndex={getTabIndex(
                                isDisabled,
                                globalIndex === focusedIndex
                            )}
                            role="gridcell"
                            aria-label={`${dayItem} ${
                                dayjs.monthsShort()[nextMonth]
                            }`}
                            aria-disabled={isDisabled}
                        >
                            <p
                                className={`${primaryTextClasses} ${getDisabledClasses(
                                    nextMonth,
                                    dayItem
                                )}`}
                            >
                                {dayItem}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
