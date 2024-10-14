import { render, fireEvent, waitFor, screen } from '@testing-library/react';

import { NOOP } from '@deps/types/constants';

import SpinnerButton from './spinner-button';

describe('SpinnerButton component', () => {
    const buttonText = 'Click me';

    it('renders button with correct text', () => {
        render(<SpinnerButton text={buttonText} onClick={NOOP} />);

        expect(screen.getByText(buttonText)).toBeInTheDocument();
    });

    it('displays loader when clicked', async () => {
        render(<SpinnerButton text={buttonText} onClick={NOOP} />);

        fireEvent.click(screen.getByText(buttonText));

        await waitFor(() => {
            expect(screen.getByTestId('test-loader')).toBeInTheDocument();
        });
    });

    it('sets button to inactive after click', async () => {
        render(<SpinnerButton text={buttonText} onClick={NOOP} />);

        fireEvent.click(screen.getByText(buttonText));

        await waitFor(() => {
            expect(screen.getByText(buttonText)).toHaveClass('cursor-wait');
        });
    });

    it('calls onClick function when button is clicked', () => {
        const onClickMock = jest.fn();

        render(<SpinnerButton text={buttonText} onClick={onClickMock} />);

        fireEvent.click(screen.getByText(buttonText));

        expect(onClickMock).toHaveBeenCalled();
    });
});
