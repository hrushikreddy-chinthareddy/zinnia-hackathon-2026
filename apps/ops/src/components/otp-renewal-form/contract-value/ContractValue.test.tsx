import { fireEvent, render, screen } from '@testing-library/react';

import ContractValue from './ContractValue';

describe('Contract Value Component ', () => {
    it('should renders the component with field label and input field', () => {
        render(<ContractValue />);
        expect(screen.getByText(`contractValue`)).toBeInTheDocument();
        const contractValueInput = screen
            .getByTestId('field-input-test-id')
            .querySelector('input');
        expect(contractValueInput).toHaveValue('');

        const selectedClass =
            'text-right w-full w-full border-0 bg-transparent p-0 font-secondary text-md font-normal leading-5.5 !outline-none !ring-0 px-4 py-2 cursor-auto';
        expect(contractValueInput).toHaveClass(selectedClass);
        expect(screen.getByText(`contractValue`)).toHaveClass(
            'field-label text-gray-900 text-md mr-2'
        );
    });

    it('should update input by typed numeric value', () => {
        render(<ContractValue />);
        const input = screen.getByTestId(
            'contract-value-test-id'
        ) as HTMLInputElement;
        fireEvent.change(input, { target: { value: '10' } });
        expect(input.value).toBe('10');
    });

    it('should update input by typed numeric value with decimal', () => {
        render(<ContractValue />);
        const input = screen.getByTestId(
            'contract-value-test-id'
        ) as HTMLInputElement;
        fireEvent.change(input, { target: { value: '123.45' } });
        expect(input.value).toBe('123.45');
    });

    it('should not update input any non-numeric value is passed', () => {
        render(<ContractValue />);
        const input = screen.getByTestId(
            'contract-value-test-id'
        ) as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'abc' } });
        expect(input.value).toBe('');
    });
});
