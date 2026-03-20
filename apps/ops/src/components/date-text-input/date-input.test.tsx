import { fireEvent, render, screen } from '@testing-library/react';

import DateInput, { DateInputProps } from './date-input';

const defaultProps: DateInputProps = {
    onChange: () => {},
    onBlur: () => {},
    defaultDate: undefined,
    disabled: false,
    errorMessage: undefined,
    popOverTitle: 'Pop over',
};

describe('Client Case - Date Input Component', () => {
    it('should render input text', () => {
        render(<DateInput {...defaultProps} />);
        expect(
            screen.getByTestId('date-input-container-id')
        ).toBeInTheDocument();
        expect(screen.getByTestId('date-input-id')).toBeInTheDocument();
    });

    it('should add / automatically', () => {
        render(<DateInput {...defaultProps} />);

        const input = screen.getByTestId('date-input-id') as HTMLInputElement;

        expect(input).toBeInTheDocument();

        fireEvent.change(input, { target: { value: '0' } });
        expect(input.value).toBe('0');
        fireEvent.change(input, { target: { value: '01' } });
        expect(input.value).toBe('01');
        fireEvent.change(input, { target: { value: '010' } });
        expect(input.value).toBe('01/0');
        fireEvent.change(input, { target: { value: '0101' } });
        expect(input.value).toBe('01/01');
        fireEvent.change(input, { target: { value: '01012' } });
        expect(input.value).toBe('01/01/2');
        fireEvent.change(input, { target: { value: '01012020' } });
        expect(input.value).toBe('01/01/2020');
    });

    it('should remove / automatically', () => {
        render(<DateInput {...defaultProps} />);

        const input = screen.getByTestId('date-input-id') as HTMLInputElement;

        expect(input).toBeInTheDocument();

        fireEvent.change(input, { target: { value: '01/01/2020' } });
        expect(input.value).toBe('01/01/2020');
        fireEvent.change(input, { target: { value: '01/01/2' } });
        expect(input.value).toBe('01/01/2');
        fireEvent.change(input, { target: { value: '01/01/' } });
        expect(input.value).toBe('01/01');
        fireEvent.change(input, { target: { value: '01/0' } });
        expect(input.value).toBe('01/0');
        fireEvent.change(input, { target: { value: '01/' } });
        expect(input.value).toBe('01');
        fireEvent.change(input, { target: { value: '0' } });
        expect(input.value).toBe('0');
    });

    it('should automatically format with / a full date', () => {
        render(<DateInput {...defaultProps} />);

        const input = screen.getByTestId('date-input-id') as HTMLInputElement;

        expect(input).toBeInTheDocument();

        fireEvent.change(input, { target: { value: '01012020' } });
        expect(input.value).toBe('01/01/2020');
    });
});
