import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { CustomYesDatePicker } from './custom-date-picker';

describe('CustomYesDatePicker', () => {
    const mockOnChange = jest.fn();

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders Content always', () => {
        render(
            <CustomYesDatePicker
                option="No"
                onChange={mockOnChange}
                value=""
                error={false}
                formatOptions={{ format: '##/##/####' }}
                placeholder={'Date of Signature'}
                id={'dateOfSignature'}
                label={'Date of Signature'}
            />
        );

        expect(screen.getByText('Yes')).toBeInTheDocument();
    });

    it('does not render FieldDateSelect when option is not "Yes"', () => {
        render(
            <CustomYesDatePicker
                option="No"
                onChange={mockOnChange}
                value=""
                error={false}
                formatOptions={{ format: '##/##/####' }}
                placeholder={'Date of Signature'}
                id={'dateOfSignature'}
                label={'dateOfSignature'}
            />
        );

        expect(
            screen.queryByLabelText('dateOfSignature')
        ).not.toBeInTheDocument();
    });

    it('renders FieldDateSelect when option is "Yes"', () => {
        render(
            <CustomYesDatePicker
                option="Yes"
                onChange={mockOnChange}
                value="01/01/2025"
                error={false}
                formatOptions={{ format: '##/##/####' }}
                placeholder={'Date of Signature'}
                id={'dateOfSignature'}
                label={'dateOfSignature'}
            />
        );

        expect(screen.getByLabelText('dateOfSignature')).toBeInTheDocument();
    });

    it('calls onChange when input value changes', () => {
        render(
            <CustomYesDatePicker
                option="Yes"
                onChange={mockOnChange}
                value=""
                error={false}
                formatOptions={{ format: '##/##/####' }}
                placeholder={'Date of Signature'}
                id={'dateOfSignature'}
                label={'dateOfSignature'}
            />
        );

        fireEvent.change(screen.getByLabelText('dateOfSignature'), {
            target: { value: '02/02/2025' },
        });

        expect(mockOnChange).toHaveBeenCalled();
    });
});
