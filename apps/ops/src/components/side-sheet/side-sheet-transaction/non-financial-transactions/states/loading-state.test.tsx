import { render, screen } from '@testing-library/react';

import LoadingState from './loading-state';

// Mock the PageLoader component and its variant
jest.mock('@deps/components/page-loader/page-loader', () => {
    return {
        __esModule: true,
        default: ({ variant }: { variant: string }) => (
            <div data-testid="mock-pageloader">Mock PageLoader - {variant}</div>
        ),
        PageLoaderVariant: { Center: 'Center' },
    };
});

describe('LoadingState', () => {
    it('renders without crashing', () => {
        render(<LoadingState />);
        expect(screen.getByTestId('mock-pageloader')).toBeInTheDocument();
    });

    it('renders PageLoader with Center variant', () => {
        render(<LoadingState />);
        const loader = screen.getByTestId('mock-pageloader');
        expect(loader).toHaveTextContent('Mock PageLoader - Center');
    });
});
