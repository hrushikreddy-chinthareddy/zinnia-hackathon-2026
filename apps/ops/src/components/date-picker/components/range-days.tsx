import dayjs from 'dayjs';

import { ReactComponent as ArrowLeftMediumIcon } from '@deps/styles/elements/icons/icons_outlined/arrow-left-medium.svg';
import { ReactComponent as ArrowRightMediumIcon } from '@deps/styles/elements/icons/icons_outlined/arrow-right-medium.svg';

import { useKeyboardNavigation } from '../useKeyboardNavigation';
import {
    createClickHandler,
    createKeyDownHandler,
    primaryTextClasses,
    secondaryTextClasses,
    containerClasses,
} from '../utils';

interface RangeDaysProps {
    daysOpen: boolean;
    getDisabledClasses: (_month: number, _day: number) => string;
    getSelectedRangeClasses: (_month: number, _day: number) => string;
    handleDateSelect: (_year: number, _month: number, _day: number) => void;
    handleMonthChange: (_month: number, delta: number) => void;
    handleOpenMonths: () => void;
    month: number;
    year: number;
    onEscape?: () => void;
}

export const RangeDays = ({
    daysOpen,
    getDisabledClasses,
    getSelectedRangeClasses,
    handleDateSelect,
    handleMonthChange,
    handleOpenMonths,
    month,
    year,
    onEscape,
}: RangeDaysProps) => {
    const weekdays = dayjs.weekdaysShort();
    const firstDayOfFirstMonth = dayjs().year(year).month(month).date(1).day();
    const firstDayOfSecondMonth = dayjs()
        .year(year)
        .month(month + 1)
        .date(1)
        .day();

    const daysInFirstMonth = dayjs().year(year).month(month).daysInMonth();
    const daysOfFirstMonth = Array.from(
        { length: daysInFirstMonth },
        (_, i) => i + 1
    );
    const firstMonthStartBuffer = Array.from(
        { length: firstDayOfFirstMonth },
        (_, i) => i + 1
    );

    const daysInSecondMonth = dayjs()
        .year(year)
        .month(month + 1)
        .daysInMonth();
    const daysOfSecondMonth = Array.from(
        { length: daysInSecondMonth },
        (_, i) => i + 1
    );
    const secondMonthStartBuffer = Array.from(
        { length: firstDayOfSecondMonth },
        (_, i) => i + 1
    );

    const secondMonth = month + 1 === 12 ? 0 : month + 1;
    const secondYear = month + 1 === 12 ? year + 1 : year;

    const allDays = [
        ...Array.from({ length: firstDayOfFirstMonth }, () => null),
        ...daysOfFirstMonth.map((day) => ({ day, month, year, type: 'first' })),
        ...Array.from({ length: firstDayOfSecondMonth }, () => null),
        ...daysOfSecondMonth.map((day) => ({
            day,
            month: secondMonth,
            year: secondYear,
            type: 'second',
        })),
    ];

    const { focusedIndex, setItemRef, handleKeyDown } = useKeyboardNavigation(
        allDays.length,
        14,
        (index) => {
            const dayData = allDays[index];
            if (dayData) {
                handleDateSelect(dayData.year, dayData.month, dayData.day);
            }
        },
        onEscape
    );

    if (!daysOpen) return null;

    return (
        <div className="flex flex-row" onKeyDown={handleKeyDown}>
            <div className="flex flex-col gap-4 p-4 pr-2">
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
                        onKeyDown={createKeyDownHandler(() =>
                            handleOpenMonths()
                        )}
                        aria-label={`${
                            dayjs.months()[month]
                        } ${year}, click to select month`}
                    >
                        <p
                            className={`${primaryTextClasses} cursor-pointer`}
                        >{`${dayjs.months()[month]} ${year}`}</p>
                    </button>
                    <div className={`${containerClasses} invisible`}>
                        <ArrowRightMediumIcon width={21} height={21} />
                    </div>
                </div>
                <div className="grid grid-cols-7">
                    {weekdays.map((dayItem, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-center"
                        >
                            <p className={secondaryTextClasses}>{dayItem}</p>
                        </div>
                    ))}
                    {firstMonthStartBuffer.map((index) => (
                        <div
                            key={index}
                            className="flex items-center justify-center"
                        />
                    ))}
                    {daysOfFirstMonth.map((dayItem, index) => (
                        <div
                            key={index}
                            className={`${containerClasses} ${getSelectedRangeClasses(
                                month,
                                dayItem
                            )} ${getDisabledClasses(
                                month,
                                dayItem
                            )} flex items-center justify-center`}
                            onClick={() =>
                                handleDateSelect(year, month, dayItem)
                            }
                        >
                            <p
                                className={`${primaryTextClasses} ${getDisabledClasses(
                                    month,
                                    dayItem
                                )}`}
                            >
                                {dayItem}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-4 p-4 pl-2">
                <div className="flex flex-row justify-between text-gray-900">
                    <div className={`${containerClasses} invisible`}>
                        <ArrowLeftMediumIcon width={21} height={21} />
                    </div>
                    <button
                        className={containerClasses}
                        onClick={createClickHandler(() => handleOpenMonths())}
                        onKeyDown={createKeyDownHandler(() =>
                            handleOpenMonths()
                        )}
                        aria-label={`${
                            dayjs.months()[secondMonth]
                        } ${secondYear}, click to select month`}
                    >
                        <p
                            className={`${primaryTextClasses} cursor-pointer`}
                        >{`${dayjs.months()[secondMonth]} ${secondYear}`}</p>
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
                <div className="grid grid-cols-7">
                    {weekdays.map((dayItem, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-center"
                        >
                            <p className={secondaryTextClasses}>{dayItem}</p>
                        </div>
                    ))}
                    {secondMonthStartBuffer.map((index) => (
                        <div
                            key={index}
                            className="flex items-center justify-center"
                        />
                    ))}
                    {daysOfSecondMonth.map((dayItem, index) => (
                        <div
                            key={index}
                            className={`${containerClasses} ${getSelectedRangeClasses(
                                month + 1,
                                dayItem
                            )} ${getDisabledClasses(
                                month + 1,
                                dayItem
                            )} flex items-center justify-center`}
                            onClick={() =>
                                handleDateSelect(year, month + 1, dayItem)
                            }
                        >
                            <p
                                className={`${primaryTextClasses} ${getDisabledClasses(
                                    month + 1,
                                    dayItem
                                )}`}
                            >
                                {dayItem}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
