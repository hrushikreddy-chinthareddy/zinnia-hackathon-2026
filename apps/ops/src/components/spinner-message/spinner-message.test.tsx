import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { SpinnerMessage } from './spinner-message';

describe('SpinnerMessage', () => {
    const message = 'Loading data';

    it('renders the spinner message text', () => {
        render(<SpinnerMessage message={message} />);

        expect(screen.getByText(message)).toBeInTheDocument();
    });

    it('renders a status region for accessibility', () => {
        render(<SpinnerMessage message={message} />);

        const region = screen.getByRole('status');
        expect(region).toBeInTheDocument();
        expect(region).toHaveAttribute('aria-busy', 'true');
        expect(region).toHaveAttribute('aria-live', 'polite');
    });
});
