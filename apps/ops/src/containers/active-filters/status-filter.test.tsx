import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useTranslation } from 'next-i18next';

import { Statuses } from '@deps/models/case/case';

import StatusFilter from './status-filter';

jest.mock('next-i18next', () => ({
    useTranslation: jest.fn(),
}));

jest.mock('@deps/components/chip-status/chip-status', () => ({
    __esModule: true,
    default: ({ statusText }: { statusText: string }) => (
        <div data-testid={`chip-status-${statusText}`}>{statusText}</div>
    ),
}));

jest.mock(
    '@deps/components/quick-actions-menu/quick-action-text-button',
    () => ({
        __esModule: true,
        TextButton: ({ label }: { label: string }) => (
            <div data-testid="text-button">{label}</div>
        ),
    })
);

jest.mock('@deps/helpers/analytics/segment-analytics', () => ({
    segmentAnalyticsTrackEvent: jest.fn(),
}));

// Helper to mock window.innerWidth
const mockWindowInnerWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width,
    });
};

describe('StatusFilter', () => {
    const defaultProps = {
        onChange: jest.fn(),
        sessionId: 'test-session',
        userId: 'test-user',
        values: [],
        caseTotals: {
            [Statuses.All]: 174939,
            [Statuses.InProgress]: 89271,
            [Statuses.Exception]: 31489,
            [Statuses.Completed]: 44069,
            [Statuses.Canceled]: 10110,
        },
    };

    beforeEach(() => {
        (useTranslation as jest.Mock).mockReturnValue({
            t: (key: string) => {
                const translations: { [key: string]: string } = {
                    'status.all': 'All',
                    'status.inProgress': 'In progress',
                    'status.exception': 'Not in good order',
                    'status.completed': 'Completed',
                    'status.canceled': 'Canceled',
                    'button.showAll': 'Show more',
                    'button.showLess': 'Show less',
                };
                return translations[key] || key;
            },
            i18n: { language: 'en', changeLanguage: jest.fn() },
        });

        mockWindowInnerWidth(1200);
        jest.clearAllMocks();
    });

    // Suppress React warnings for nested buttons
    const suppressConsoleError = () =>
        jest.spyOn(console, 'error').mockImplementation(() => {});

    it('renders all status chips on desktop', () => {
        const spy = suppressConsoleError();

        render(<StatusFilter {...defaultProps} />);

        // Check that the status text is present
        expect(screen.getByText('All')).toBeInTheDocument();
        expect(screen.getByText('In progress')).toBeInTheDocument();
        expect(screen.getByText('Not in good order')).toBeInTheDocument();
        expect(screen.getByText('Completed')).toBeInTheDocument();
        expect(screen.getByText('Canceled')).toBeInTheDocument();

        // Get all the status chips
        const allChip = screen.getByText('All').closest('button');
        const inProgressChip = screen
            .getByText('In progress')
            .closest('button');
        const notInGoodOrderChip = screen
            .getByText('Not in good order')
            .closest('button');
        const completedChip = screen.getByText('Completed').closest('button');
        const canceledChip = screen.getByText('Canceled').closest('button');

        // Helper function to check if a chip contains the expected text and number
        const expectChipToContain = (
            chip: HTMLElement | null,
            text: string,
            number: string
        ) => {
            expect(chip).toBeInTheDocument();
            const chipText = chip?.textContent || '';

            // Check that the chip contains the text (case insensitive)
            expect(chipText.toLowerCase()).toContain(text.toLowerCase());

            // Check that the chip contains the number (with or without formatting)
            const numberFound = [
                number, // Check for exact match
                number.replace(/,/g, ''), // Check without commas
                Number(number.replace(/,/g, '')).toLocaleString(), // Localized format
                Number(number.replace(/,/g, '')).toLocaleString('en-IN'), // Indian format
                number.replace(/,/g, ','), // Ensure comma-separated format
            ].some((format) => chipText.includes(format));

            expect(numberFound).toBe(true);
        };

        // Check each chip with the helper function
        expectChipToContain(allChip, 'All', '174939');
        expectChipToContain(inProgressChip, 'In progress', '89271');
        expectChipToContain(notInGoodOrderChip, 'Not in good order', '31489');
        expectChipToContain(completedChip, 'Completed', '44069');
        expectChipToContain(canceledChip, 'Canceled', '10110');

        spy.mockRestore();
    });

    it('renders only selected chips and show more button on mobile', async () => {
        mockWindowInnerWidth(500);
        render(
            <StatusFilter {...defaultProps} values={[Statuses.InProgress]} />
        );

        await waitFor(() => {
            expect(screen.getByText('In progress')).toBeInTheDocument();
            expect(
                screen.queryByText('Not in good order')
            ).not.toBeInTheDocument();
            expect(screen.queryByText('Completed')).not.toBeInTheDocument();
            expect(screen.queryByText('Canceled')).not.toBeInTheDocument();
        });

        expect(screen.getByTestId('text-button')).toHaveTextContent(
            'Show more'
        );
    });

    it('calls onChange when a chip is clicked', () => {
        const spy = suppressConsoleError();
        render(<StatusFilter {...defaultProps} />);

        const allChipButton = screen.getByText('All').closest('button')!;
        fireEvent.click(allChipButton);

        expect(defaultProps.onChange).toHaveBeenCalledWith([]);
        spy.mockRestore();
    });

    it('toggles chip selection when clicked', () => {
        const spy = suppressConsoleError();
        render(
            <StatusFilter {...defaultProps} values={[Statuses.InProgress]} />
        );

        const chipButton = screen.getByText('In progress').closest('button')!;
        fireEvent.click(chipButton);

        expect(defaultProps.onChange).toHaveBeenCalledWith([]);
        spy.mockRestore();
    });

    it('selects All and deselects others when All is clicked', () => {
        const spy = suppressConsoleError();
        render(
            <StatusFilter
                {...defaultProps}
                values={[Statuses.InProgress, Statuses.Completed]}
            />
        );

        const allChipButton = screen.getByText('All').closest('button')!;
        fireEvent.click(allChipButton);

        expect(defaultProps.onChange).toHaveBeenCalledWith([]);
        spy.mockRestore();
    });

    it('shows all chips when show more is clicked on mobile', async () => {
        mockWindowInnerWidth(500);
        const spy = suppressConsoleError();
        render(
            <StatusFilter {...defaultProps} values={[Statuses.InProgress]} />
        );

        const showMoreButton = screen.getByTestId('text-button');
        fireEvent.click(showMoreButton);

        await waitFor(() => {
            expect(screen.getByText('Not in good order')).toBeInTheDocument();
            expect(screen.getByText('Completed')).toBeInTheDocument();
            expect(screen.getByText('Canceled')).toBeInTheDocument();
        });

        expect(screen.getByTestId('text-button')).toHaveTextContent(
            'Show less'
        );
        spy.mockRestore();
    });
});
