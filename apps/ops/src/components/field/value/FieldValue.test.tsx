import { render, screen, fireEvent } from '@testing-library/react';
import { Label } from '@zinnia/bloom/components';

import { FieldValue } from './FieldValue';
import { FieldStatus } from '../types';

describe('FieldValue', () => {
    const label = <Label>Amount</Label>;

    it('renders with default props', () => {
        render(
            <FieldValue
                name="field-value"
                label={label}
                errorMessage="Error"
                onChange={() => {}}
            />
        );
        expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    });

    it('displays currency symbol', () => {
        render(
            <FieldValue
                name="field-value"
                label={label}
                currencySymbol="£"
                errorMessage="Error"
                onChange={() => {}}
            />
        );
        expect(screen.getByText('£')).toBeInTheDocument();
    });

    it('displays error message when isError is true', () => {
        render(
            <FieldValue
                name="field-value"
                label={label}
                errorMessage="Custom error message"
                onChange={() => {}}
                fieldStatus={FieldStatus.ERROR}
            />
        );
        expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('disables input when disabled is true', () => {
        render(
            <FieldValue
                name="field-value"
                label={label}
                disabled
                errorMessage="Error"
                onChange={() => {}}
            />
        );
        expect(screen.getByLabelText('Amount')).toBeDisabled();
    });

    it('handles input change', () => {
        render(
            <FieldValue
                name="field-value"
                label={label}
                errorMessage="Error"
                value={'123'}
            />
        );
        const input = screen.getByLabelText('Amount');
        fireEvent.change(input, { target: { value: '123' } });
        expect(input).toHaveValue('123');
    });

    it('does not accept non-numeric input', () => {
        render(
            <FieldValue
                name="field-value"
                label={label}
                errorMessage="Error"
                onChange={() => {}}
            />
        );
        const input = screen.getByLabelText('Amount');
        fireEvent.change(input, { target: { value: 'abc' } });
        expect(input).toHaveValue('');
    });

    it('uses custom onChange handler', () => {
        const handleChange = jest.fn();
        render(
            <FieldValue
                name="field-value"
                label={label}
                onChange={handleChange}
                errorMessage="Error"
            />
        );
        const input = screen.getByLabelText('Amount');
        fireEvent.change(input, { target: { value: '123' } });
        expect(handleChange).toHaveBeenCalled();
    });
});
