import dayjs from 'dayjs';
import { Dispatch, SetStateAction } from 'react';

import { ReactComponent as ArrowLeftMediumIcon } from '@deps/styles/elements/icons/icons_outlined/arrow-left-medium.svg';
import { ReactComponent as ArrowRightMediumIcon } from '@deps/styles/elements/icons/icons_outlined/arrow-right-medium.svg';

import { useKeyboardNavigation } from '../useKeyboardNavigation';
import {
    createClickHandler,
    createKeyDownHandler,
    primaryTextClasses,
    containerClasses,
} from '../utils';

interface MonthsProps {
    handleCloseMonths: (month: number) => void;
    handleOpenYears: () => void;
    isRange: boolean | null;
    monthsOpen: boolean;
    setYear: Dispatch<SetStateAction<number>>;
    year: number;
    onEscape?: () => void;
}

export const Months = ({
    handleCloseMonths,
    handleOpenYears,
    isRange,
    monthsOpen,
    setYear,
    year,
    onEscape,
}: MonthsProps) => {
    const months = dayjs.monthsShort();
    const columns = isRange ? 6 : 4;

    const { focusedIndex, setItemRef, handleKeyDown } = useKeyboardNavigation(
        months.length,
        columns,
        (index) => handleCloseMonths(index),
        onEscape
    );

    if (!monthsOpen) return null;

    return (
        <div className="flex flex-col gap-4 p-4" onKeyDown={handleKeyDown}>
            <div className="flex flex-row justify-between text-gray-900">
                <button
                    className={containerClasses}
                    onClick={createClickHandler(() =>
                        setYear((prev) => prev - 1)
                    )}
                    onKeyDown={createKeyDownHandler(() =>
                        setYear((prev) => prev - 1)
                    )}
                    aria-label="Previous year"
                >
                    <ArrowLeftMediumIcon width={21} height={21} />
                </button>
                <button
                    className={containerClasses}
                    onClick={createClickHandler(() => handleOpenYears())}
                    onKeyDown={createKeyDownHandler(() => handleOpenYears())}
                    aria-label={`Year ${year}, click to select year`}
                >
                    <p className={`${primaryTextClasses} cursor-pointer`}>
                        {year}
                    </p>
                </button>
                <button
                    className={containerClasses}
                    onClick={createClickHandler(() =>
                        setYear((prev) => prev + 1)
                    )}
                    onKeyDown={createKeyDownHandler(() =>
                        setYear((prev) => prev + 1)
                    )}
                    aria-label="Next year"
                >
                    <ArrowRightMediumIcon width={21} height={21} />
                </button>
            </div>
            <div
                className={`grid gap-6 grid-cols-${columns}`}
                role="grid"
                aria-label="Months"
            >
                {months.map((monthItem, index) => (
                    <button
                        key={index}
                        ref={setItemRef(index)}
                        className={`${containerClasses} flex items-center justify-center focus:ring-2 focus:ring-primary focus:ring-offset-2`}
                        onClick={createClickHandler(() =>
                            handleCloseMonths(index)
                        )}
                        tabIndex={index === focusedIndex ? 0 : -1}
                        role="gridcell"
                        aria-label={`Month ${monthItem}`}
                    >
                        <p className={primaryTextClasses}>{monthItem}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};
