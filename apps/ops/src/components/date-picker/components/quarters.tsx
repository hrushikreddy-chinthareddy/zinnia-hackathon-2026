import { Dispatch, SetStateAction } from 'react';

import { ReactComponent as ArrowLeftMediumIcon } from '@deps/styles/elements/icons/icons_outlined/arrow-left-medium.svg';
import { ReactComponent as ArrowRightMediumIcon } from '@deps/styles/elements/icons/icons_outlined/arrow-right-medium.svg';

import { DatePickerTypes, Quarter, quarters } from '../types';
import { useKeyboardNavigation } from '../useKeyboardNavigation';
import {
    createClickHandler,
    createKeyDownHandler,
    primaryTextClasses,
    containerClasses,
} from '../utils';

enum DatePickerDirection {
    start = 'start',
    end = 'end',
}

type QuartersProps = {
    setYear: Dispatch<SetStateAction<number>>;
    handleQuarterSelection: (_year: number, _quarter: Quarter) => void;
    handleYearSelection: (_year: number) => void;
    quartersOpen: boolean;
    getDisabledQuarterClasses: (
        _year: number,
        _quarter?: number,
        pickerDirection?: DatePickerDirection
    ) => string;
    getSelectedQuarterClasses: (_month: number, _quarter: Quarter) => string;
    year: number;
    datePickerType: DatePickerTypes;
    onEscape?: () => void;
};

export const Quarters = ({
    quartersOpen,
    getDisabledQuarterClasses,
    getSelectedQuarterClasses,
    handleQuarterSelection,
    handleYearSelection,
    year,
    setYear,
    datePickerType,
    onEscape,
}: QuartersProps) => {
    // Used to determine what weekday the month begins on
    const disableQuarters =
        datePickerType === DatePickerTypes.Annually
            ? '!cursor-auto !pointer-events-none !text-gray-300'
            : '';

    const { focusedIndex, setItemRef, handleKeyDown } = useKeyboardNavigation(
        quarters.length,
        4, // 4 columns for quarters grid
        (index) => handleQuarterSelection(year, quarters[index]?.value),
        onEscape
    );

    if (!quartersOpen) return null;

    return (
        <div className="flex flex-col gap-4 p-4" onKeyDown={handleKeyDown}>
            <div className="flex flex-row justify-between text-gray-900">
                <button
                    className={`${containerClasses} ${getDisabledQuarterClasses(
                        year,
                        undefined,
                        DatePickerDirection.start
                    )}`}
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
                    onClick={createClickHandler(() =>
                        handleYearSelection(year)
                    )}
                    onKeyDown={createKeyDownHandler(() =>
                        handleYearSelection(year)
                    )}
                    aria-label={`Year ${year}, click to select year`}
                >
                    <p
                        className={`${primaryTextClasses} cursor-pointer`}
                    >{`${year}`}</p>
                </button>
                <button
                    className={`${containerClasses} ${getDisabledQuarterClasses(
                        year,
                        undefined,
                        DatePickerDirection.end
                    )}`}
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
            <div className="grid grid-cols-4" role="grid" aria-label="Quarters">
                {quarters.map((quarterItem, index) => {
                    const isDisabled =
                        getDisabledQuarterClasses(
                            year,
                            quarterItem.month + 1,
                            DatePickerDirection.start
                        ).includes('pointer-events-none') ||
                        disableQuarters.includes('pointer-events-none');

                    return (
                        <button
                            key={index}
                            ref={setItemRef(index)}
                            className={`${containerClasses} ${getSelectedQuarterClasses(
                                year,
                                quarterItem?.value
                            )} ${getDisabledQuarterClasses(
                                year,
                                quarterItem.month + 1,
                                DatePickerDirection.start
                            )} ${disableQuarters} flex items-center justify-center focus:ring-2 focus:ring-primary focus:ring-offset-2`}
                            onClick={createClickHandler(() =>
                                handleQuarterSelection(year, quarterItem?.value)
                            )}
                            tabIndex={index === focusedIndex ? 0 : -1}
                            role="gridcell"
                            aria-label={`Quarter ${quarterItem.label}`}
                            aria-disabled={isDisabled}
                        >
                            <p
                                className={`${primaryTextClasses} ${getDisabledQuarterClasses(
                                    year,
                                    quarterItem.month + 1,
                                    DatePickerDirection.start
                                )} ${disableQuarters}`}
                            >
                                {quarterItem.label}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
