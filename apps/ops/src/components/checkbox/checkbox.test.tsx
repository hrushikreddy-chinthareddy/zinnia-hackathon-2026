import { fireEvent, render, screen } from '@testing-library/react';

import CheckboxText from './checkbox-text/checkbox-text';

describe('Checkbox', () => {
    test('renders the checkbox with label', () => {
        render(<CheckboxText label="Test Checkbox" />);

        const checkboxElement = screen.getByTestId('checkbox');
        expect(checkboxElement).toBeInTheDocument();
    });

    test('handles checked and unchecked states', () => {
        const onChangeMock = jest.fn();

        render(<CheckboxText label="Test Checkbox" onChange={onChangeMock} />);
        const checkboxElement = screen.getByTestId('checkbox');

        // Initial state
        expect(checkboxElement).not.toBeChecked();

        // Simulate a click to check the checkbox
        fireEvent.click(checkboxElement);
        expect(checkboxElement).toBeChecked();
        expect(onChangeMock).toHaveBeenCalledWith(true);

        // Simulate a click to uncheck the checkbox
        fireEvent.click(checkboxElement);
        expect(checkboxElement).not.toBeChecked();
        expect(onChangeMock).toHaveBeenCalledWith(false);
    });

    // If ever needed, this test can be uncommented and updated to test the indeterminate state
    // test('handles indeterminate state', () => {
    //     const onChangeMock = jest.fn();

    //     render(<CheckboxText label="Indeterminate Checkbox" onChange={onChangeMock} isIndeterminate={true} />);

    //     const checkboxElement = screen.getByTestId('checkbox');

    //     // Initial state
    //     expect(checkboxElement).not.toBeChecked();

    //     // Simulate a click to check the checkbox
    //     fireEvent.click(checkboxElement);
    //     expect(checkboxElement).toBeChecked();
    //     expect(onChangeMock).toHaveBeenCalledWith(true);

    //     // Simulate a click to set the checkbox to indeterminate state
    //     fireEvent.click(checkboxElement);
    //     expect(onChangeMock).toHaveBeenCalledWith('indeterminate');

    //     // Simulate a click to uncheck the checkbox
    //     fireEvent.click(checkboxElement);
    //     expect(checkboxElement).not.toBeChecked();
    //     expect(onChangeMock).toHaveBeenCalledWith(false);
    // });

    test('disables checkbox when isDisabled prop is set', () => {
        const onChangeMock = jest.fn();

        render(
            <CheckboxText
                label="Disabled Checkbox"
                onChange={onChangeMock}
                isDisabled={true}
            />
        );

        const checkboxElement = screen.getByTestId('checkbox');

        expect(checkboxElement).toBeDisabled();

        // Simulate a click on the disabled checkbox
        fireEvent.click(checkboxElement);
        expect(onChangeMock).not.toHaveBeenCalled();
    });
});
