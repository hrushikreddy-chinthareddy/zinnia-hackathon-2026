import { render, fireEvent, screen, act } from '@testing-library/react';

import TransactionCta from './transaction-cta';

beforeEach(() => {
    jest.useFakeTimers();
});

afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
});

describe('TransactionCta', () => {
    const mainCta = { text: 'Main Button', onClick: jest.fn() };
    const secondaryCta = { text: 'Secondary Button', href: '/secondary' };

    test('renders main CTA button', () => {
        render(<TransactionCta mainCta={mainCta} secondaryCta={secondaryCta} />);

        expect(screen.getByText('Main Button')).toBeInTheDocument();
    });

    test('calls main CTA onClick handler when clicked', () => {
        render(<TransactionCta mainCta={mainCta} secondaryCta={secondaryCta} />);

        fireEvent.click(screen.getByText('Main Button'));

        expect(mainCta.onClick).toHaveBeenCalledTimes(1);
    });

    test('renders secondary CTA button if provided', () => {
        render(<TransactionCta mainCta={mainCta} secondaryCta={secondaryCta} />);

        expect(screen.getByText('Secondary Button')).toBeInTheDocument();
    });

    test('does not render secondary CTA button if not provided', () => {
        render(<TransactionCta mainCta={mainCta} />);

        expect(screen.queryByText('Secondary Button')).not.toBeInTheDocument();
    });

    test('shows assistive text after clicking main CTA button', () => {
        render(<TransactionCta mainCta={mainCta} secondaryCta={secondaryCta} />);

        fireEvent.click(screen.getByText('Main Button'));

        act(() => {
            jest.advanceTimersByTime(3000);
        });
        expect(screen.getByText('checkingRules')).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(3000);
        });
        expect(screen.getByText('creatingSummary')).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(3000);
        });
        expect(screen.getByText('upTo15')).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(3000);
        });
        expect(screen.getByText('stillWorking')).toBeInTheDocument();
    });
});
