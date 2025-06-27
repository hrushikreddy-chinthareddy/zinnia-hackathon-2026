import { render, fireEvent } from '@testing-library/react';

import InputCheckBox from './input-checkbox';

describe('InputCheckBox', () => {
    it('should render correctly with default props', () => {
        const { container } = render(
            <InputCheckBox checked={false} onChange={() => {}} />
        );
        const checkbox = container.querySelector('input[type="checkbox"]');
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).not.toBeChecked();
        expect(checkbox).not.toBeDisabled();
    });

    it('should not change state when clicked if disabled', () => {
        const handleChange = jest.fn();
        const { container } = render(
            <InputCheckBox
                checked={false}
                isDisabled={true}
                onChange={handleChange}
            />
        );
        const checkbox = container.querySelector('input[type="checkbox"]');
        fireEvent.click(checkbox as any);
        expect(handleChange).not.toHaveBeenCalled();
        expect(checkbox).toBeDisabled();
    });
});
