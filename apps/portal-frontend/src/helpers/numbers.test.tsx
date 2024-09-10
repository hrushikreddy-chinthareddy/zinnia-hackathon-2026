import { render, screen } from '@testing-library/react';

import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import { AccessibleFormattedAmount, determineRange, divideEvenly, numberFormatify, percentFormatify } from './numbers.helper';

describe('Numbers Helper', () => {
    describe('AccessibleFormattedAmount component', () => {
        it('formats negative amounts correctly', () => {
            const amount = -100;
            render(<AccessibleFormattedAmount amount={amount} />);

            const visuallyHidden = screen.getByText('−');
            expect(visuallyHidden).toBeInTheDocument();
            expect(visuallyHidden).toHaveClass('sr-only');

            expect(screen.getByText('(')).toBeVisible();
            expect(screen.getByText('$100.00')).toBeVisible();
            expect(screen.getByText(')')).toBeVisible();
        });

        it('formats positive amounts correctly', () => {
            const amount = 100;
            render(<AccessibleFormattedAmount amount={amount} />);

            expect(screen.getByText('$100.00')).toBeVisible();
        });
    });

    describe('> numberFormatify', () => {
        it('should format as a defaut error string if no value, null, undefined', () => {
            const valueEmpty = '';
            const formatEmpty = numberFormatify(valueEmpty, { style: undefined });
            expect(formatEmpty).toBe(DEFAULT_ERROR_STRING);

            const valueNull = null;
            const formatNull = numberFormatify(valueNull, { style: undefined });
            expect(formatNull).toBe(DEFAULT_ERROR_STRING);

            const valueUndefined = undefined;
            const formatUndefined = numberFormatify(valueUndefined, { style: undefined });
            expect(formatUndefined).toBe(DEFAULT_ERROR_STRING);
        });

        it('should format as a float if string', () => {
            const value = '1234ffff';
            const format = numberFormatify(value);

            expect(format).toBe('$1,234.00');
        });

        it('should format via thousandths and millionths', () => {
            const value = '123456789';
            const format = numberFormatify(value);

            expect(format).toBe('$123,456,789.00');
        });

        it('should return rounded numbers in the millions range with an M next to them when specified in the parameters', () => {
            const value = '1000000';
            const format = numberFormatify(value, { style: 'currency', currency: 'USD' }, true);

            expect(format).toBe('$1M');
        });

        it('should return rounded numbers up to 1 decimal point in the millions range with an M next to them when specified in the parameters', () => {
            const value = '1200000';
            const format = numberFormatify(value, { style: 'currency', currency: 'USD' }, true);

            expect(format).toBe('$1.2M');
        });
    });

    describe('> divideEvenly', () => {
        it('should divide total evenly into n parts', () => {
            expect(divideEvenly(10, 2)).toEqual([5, 5]);
            expect(divideEvenly(15, 3)).toEqual([5, 5, 5]);
            expect(divideEvenly(100, 5)).toEqual([20, 20, 20, 20, 20]);
        });

        it('should round results to two decimal places', () => {
            expect(divideEvenly(10, 3)).toEqual([3.33, 3.33, 3.34]);
            expect(divideEvenly(15, 4)).toEqual([3.75, 3.75, 3.75, 3.75]);
        });

        it('should handle total = 0', () => {
            expect(divideEvenly(0, 5)).toEqual([0, 0, 0, 0, 0]);
        });

        it('should handle n = 1', () => {
            expect(divideEvenly(10, 1)).toEqual([10]);
        });
    });

    describe('> percentFormatify', () => {
        it('should return the default error string for null, undefined, or empty values', () => {
            const resultNull = percentFormatify(null);
            expect(resultNull).toBe(DEFAULT_ERROR_STRING);

            const resultUndefined = percentFormatify(undefined);
            expect(resultUndefined).toBe(DEFAULT_ERROR_STRING);

            const resultEmpty = percentFormatify('');
            expect(resultEmpty).toBe(DEFAULT_ERROR_STRING);
        });

        it('should return the default error string for non-numeric strings', () => {
            const result = percentFormatify('abc');
            expect(result).toBe(DEFAULT_ERROR_STRING);
        });

        it('should return the default error string for NaN values', () => {
            const result = percentFormatify(NaN);
            expect(result).toBe(DEFAULT_ERROR_STRING);
        });

        it('should format positive numeric values as percentages', () => {
            const result = percentFormatify(0.25);
            expect(result).toBe('25%');
        });

        it('should format positive numeric strings as percentages', () => {
            const result = percentFormatify('.75');
            expect(result).toBe('75%');
        });

        it('should format positive numeric strings as percentages', () => {
            const result = percentFormatify(-0.5);
            expect(result).toBe('-50%');
        });

        it('should format zero value as 0%', () => {
            const result = percentFormatify(0);
            expect(result).toBe('0%');
        });

        it('should format an integer as a percentage when isInteger option is true', () => {
            const result = percentFormatify(25, { isInteger: true });
            expect(result).toBe('25%');
        });
    });

    describe('determineRange', () => {
        it('returns a range in ascending order', () => {
            expect(determineRange(3, 7)).toEqual([3, 4, 5, 6, 7]);
        });

        it('returns a range in descending order', () => {
            expect(determineRange(8, 4)).toEqual([8, 7, 6, 5, 4]);
        });

        it('returns single number range when both numbers are the same', () => {
            expect(determineRange(5, 5)).toEqual([5]);
        });

        it('returns correct range when one number is negative', () => {
            expect(determineRange(-3, 2)).toEqual([-3, -2, -1, 0, 1, 2]);
        });
    });
});
