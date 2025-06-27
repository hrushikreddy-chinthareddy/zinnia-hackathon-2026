import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import { isNullEmptyOrUndefined } from './string.helpers';

export interface AccessibleFormattedAmountProps {
    amount?: number;
}

const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
};

export const AccessibleFormattedAmount = ({
    amount,
}: AccessibleFormattedAmountProps) => {
    if (amount == null) return null;

    if (amount < 0) {
        // remove -, wrap in ( ), screen reader accessible
        return (
            <>
                <span aria-hidden="true">(</span>
                <span className="sr-only">&minus;</span>
                {numberFormatify(Math.abs(amount))}
                <span aria-hidden="true">)</span>
            </>
        );
    }

    return <>{numberFormatify(amount)}</>;
};

export function divideEvenly(total: number, n: number): number[] {
    if (n <= 0) {
        throw new Error("'n' must be a positive integer.");
    }

    const individualValue = Math.floor((total * 100) / n) / 100; // Round to two decimal places

    const result: number[] = [];
    let remaining = total;

    for (let i = 0; i < n - 1; i++) {
        result.push(individualValue);
        remaining -= individualValue;
    }

    result.push(remaining); // Add remaining amount with two decimal places

    return result;
}

export const numberFormatify = (
    value?: number | string | null,
    options = defaultOptions,
    roundToMillion = false
): string => {
    if (isNullEmptyOrUndefined(value)) {
        return DEFAULT_ERROR_STRING;
    }

    if (typeof value === 'string') {
        value = parseFloat(value);
    }

    let numberValue = value as number;

    if (isNaN(numberValue)) {
        return DEFAULT_ERROR_STRING;
    }

    if (roundToMillion && numberValue >= 1000000) {
        numberValue = Math.round(numberValue / 100000) / 10;
        return (
            new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 1,
            }).format(numberValue) + 'M'
        );
    }

    return new Intl.NumberFormat('en-US', options).format(numberValue);
};

export const percentFormatify = (
    value?: number | string | null,
    options?: { isInteger?: boolean }
): string => {
    if (isNullEmptyOrUndefined(value)) {
        return DEFAULT_ERROR_STRING;
    }

    if (typeof value === 'string') {
        value = parseFloat(value);
    }

    let numberValue = value as number;

    if (isNaN(numberValue)) {
        return DEFAULT_ERROR_STRING;
    }

    if (options?.isInteger) {
        numberValue = numberValue / 100;
    }

    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        maximumFractionDigits: 2,
    }).format(numberValue);
};

export const wholePercentFormatify = (
    value?: number | string | null,
    options?: { isInteger?: boolean }
): string => {
    if (isNullEmptyOrUndefined(value)) {
        return DEFAULT_ERROR_STRING;
    }

    if (typeof value === 'string') {
        value = parseFloat(value);
    }

    let numberValue = value as number;

    if (isNaN(numberValue)) {
        return DEFAULT_ERROR_STRING;
    }

    if (options?.isInteger) {
        numberValue = numberValue / 100;
    }

    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        maximumFractionDigits: 0,
    }).format(numberValue);
};

export const forcePositiveNumber = (value?: number | string | null): string => {
    if (isNullEmptyOrUndefined(value)) {
        return DEFAULT_ERROR_STRING;
    }

    // Convert string to number if necessary
    if (typeof value === 'string') {
        value = parseFloat(value);
    }

    const numberValue = value as number;

    // Check if the value is a valid number
    if (isNaN(numberValue)) {
        return DEFAULT_ERROR_STRING;
    }

    // If the number is negative, convert to positive
    const positiveValue = numberValue < 0 ? -numberValue : numberValue;

    // Return the positive value as a string
    return positiveValue.toString();
};

export const negativeNumberFormatify = (
    value?: number | string | null
): string => {
    // if passed in null or undefined, return $0.00 insteand of DEFAULT_ERROR_STRING
    if (isNullEmptyOrUndefined(value)) {
        return '$0.00';
    }

    // Convert string to number if necessary
    if (typeof value === 'string') {
        value = parseFloat(value);
    }

    const numberValue = value as number;

    // Format the value as a string
    const formattedValue = numberValue.toFixed(2);

    // If the number is negative, wrap in parentheses
    return numberValue > 0 ? `($${formattedValue})` : `$${formattedValue}`;
};

export const determineRange = (start: number, end: number) => {
    const range = [];

    if (start > end) {
        for (let i = start; i >= end; i--) {
            range.push(i);
        }
    } else {
        for (let i = start; i <= end; i++) {
            range.push(i);
        }
    }

    return range;
};

export const formatNumberLabel = (
    label: string,
    val: number | null
): string => {
    return val && val > 1 ? `${label}s` : label;
};

export const wholeNumberFormatify = (
    value?: number | string | null,
    roundToMillion = false
): string => {
    if (isNullEmptyOrUndefined(value)) {
        return DEFAULT_ERROR_STRING;
    }

    if (typeof value === 'string') {
        value = parseFloat(value);
    }

    let numberValue = value as number;

    if (isNaN(numberValue)) {
        return DEFAULT_ERROR_STRING;
    }

    const options: Intl.NumberFormatOptions = {
        style: 'decimal',
        maximumFractionDigits: 0,
    };

    if (roundToMillion && numberValue >= 1000000) {
        numberValue = Math.round(numberValue / 100000) / 10;
        return (
            new Intl.NumberFormat('en-US', {
                style: 'decimal',
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }).format(numberValue) + 'M'
        );
    }

    return new Intl.NumberFormat('en-US', options).format(numberValue);
};
