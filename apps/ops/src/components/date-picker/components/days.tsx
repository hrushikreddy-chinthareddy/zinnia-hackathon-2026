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

    const firstOfMonth = dayjs().year(year).month(month).date(1);
    const firstDayOfCurrentMonth = firstOfMonth.day();

    const daysInCurrentMonth = firstOfMonth.daysInMonth();
    const daysOfCurrentMonth = useMemo(
        () => Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1),
        [daysInCurrentMonth]
    );

    // Render blanks to keep grid aligned, but DO NOT render prev/next month day numbers.
    const leadingBlanks = firstDayOfCurrentMonth;

    // Keep a 6-row grid (42 cells) like before so layout doesn't jump month-to-month.
    const totalCells = 42;
    const usedCells = leadingBlanks + daysInCurrentMonth;
    const trailingBlanks = Math.max(0, totalCells - usedCells);

    // Keyboard navigation should only include focusable day buttons (current month only)
    const focusableDays = useMemo(
        () =>
            daysOfCurrentMonth.map((day, idx) => ({
                day,
                month,
                year,
                originalIndex: idx,
            })),
        [daysOfCurrentMonth, month, year]
    );

    const isIndexDisabled = useCallback(
        (index: number) => {
            const dayData = focusableDays[index];
            return getDisabledClasses(dayData.month, dayData.day).includes(
                'pointer-events-none'
            );
        },
        [focusableDays, getDisabledClasses]
    );

    const { focusedIndex, setItemRef, handleKeyDown } = useKeyboardNavigation(
        focusableDays.length,
        7,
        (index) => {
            const dayData = focusableDays[index];
            handleDateSelect(dayData.year, dayData.month, dayData.day);
        },
        onEscape,
        isIndexDisabled
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

                {/* Leading blank cells (no prev-month dates shown) */}
                {Array.from({ length: leadingBlanks }).map((_, i) => (
                    <div
                        key={`blank-leading-${i}`}
                        className={containerClasses}
                        role="gridcell"
                        aria-hidden="true"
                    />
                ))}

                {/* Current month day buttons */}
                {daysOfCurrentMonth.map((dayItem, index) => {
                    // focusedIndex indexes into focusableDays, which is current month only
                    const isDisabled = getDisabledClasses(
                        month,
                        dayItem
                    ).includes('pointer-events-none');

                    return (
                        <button
                            key={`current-${index}`}
                            ref={setItemRef(index)}
                            className={`${containerClasses} ${getSelectedClasses(
                                month,
                                dayItem
                            )} ${getDisabledClasses(month, dayItem)}`}
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
                                index === focusedIndex
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

                {/* Trailing blank cells (no next-month dates shown) */}
                {Array.from({ length: trailingBlanks }).map((_, i) => (
                    <div
                        key={`blank-trailing-${i}`}
                        className={containerClasses}
                        role="gridcell"
                        aria-hidden="true"
                    />
                ))}
            </div>
        </div>
    );
};
