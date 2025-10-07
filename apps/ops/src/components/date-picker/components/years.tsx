import { useState } from 'react';

import { ReactComponent as ArrowLeftMediumIcon } from '@deps/styles/elements/icons/icons_outlined/arrow-left-medium.svg';
import { ReactComponent as ArrowRightMediumIcon } from '@deps/styles/elements/icons/icons_outlined/arrow-right-medium.svg';

import { useKeyboardNavigation } from '../useKeyboardNavigation';
import {
    createClickHandler,
    createKeyDownHandler,
    primaryTextClasses,
    containerClasses,
} from '../utils';

interface YearsProps {
    handleCloseYears: (year: number) => void;
    isRange: boolean | null;
    year: number;
    yearsOpen: boolean;
    onEscape?: () => void;
}

export const Years = ({
    handleCloseYears,
    isRange,
    year,
    yearsOpen,
    onEscape,
}: YearsProps) => {
    const [yearsStart, setYearsStart] = useState(
        Math.floor(year / 10) * 10 - 1
    );
    const years = Array.from({ length: 12 }, (_, i) => yearsStart + i);
    const columns = isRange ? 6 : 4;

    const { focusedIndex, setItemRef, handleKeyDown } = useKeyboardNavigation(
        years.length,
        columns,
        (index) => handleCloseYears(years[index]),
        onEscape
    );

    if (!yearsOpen) return null;

    return (
        <div className="flex flex-col gap-4 p-4" onKeyDown={handleKeyDown}>
            <div className="align-center flex flex-row justify-between text-gray-900">
                <button
                    className={containerClasses}
                    onClick={createClickHandler(() =>
                        setYearsStart((prev) => prev - 10)
                    )}
                    onKeyDown={createKeyDownHandler(() =>
                        setYearsStart((prev) => prev - 10)
                    )}
                    aria-label="Previous decade"
                >
                    <ArrowLeftMediumIcon width={21} height={21} />
                </button>
                <div className={`${containerClasses} !pointer-events-none`}>
                    <p className={primaryTextClasses}>
                        {yearsStart} - {yearsStart + 11}
                    </p>
                </div>
                <button
                    className={containerClasses}
                    onClick={createClickHandler(() =>
                        setYearsStart((prev) => prev + 10)
                    )}
                    onKeyDown={createKeyDownHandler(() =>
                        setYearsStart((prev) => prev + 10)
                    )}
                    aria-label="Next decade"
                >
                    <ArrowRightMediumIcon width={21} height={21} />
                </button>
            </div>
            <div
                className={`grid gap-6 grid-cols-${columns}`}
                role="grid"
                aria-label="Years"
            >
                {years.map((yearItem, index) => (
                    <button
                        key={index}
                        ref={setItemRef(index)}
                        className={`${containerClasses} flex items-center justify-center focus:ring-2 focus:ring-primary focus:ring-offset-2`}
                        onClick={createClickHandler(() =>
                            handleCloseYears(yearItem)
                        )}
                        tabIndex={index === focusedIndex ? 0 : -1}
                        role="gridcell"
                        aria-label={`Year ${yearItem}`}
                    >
                        <p className={primaryTextClasses}>{yearItem}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};
