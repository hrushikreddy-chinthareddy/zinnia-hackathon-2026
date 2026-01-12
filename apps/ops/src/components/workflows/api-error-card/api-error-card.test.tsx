import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ApiErrorCard from './api-error-card';

const pushMock = jest.fn();
jest.mock('next/router', () => ({
    useRouter: jest.fn(() => ({
        push: pushMock,
    })),
}));

describe('ApiErrorCard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'warn').mockImplementation();
    });

    it('renders correctly', () => {
        render(
            <ApiErrorCard
                leaveRoute="/"
                submit={{ action: () => {}, text: 'Submit' }}
            />
        );

        expect(screen.getByText('title')).toBeInTheDocument();
        expect(screen.getByText('subtitle')).toBeInTheDocument();
        expect(screen.getByText('Submit')).toBeInTheDocument();
        expect(screen.getByText('leaveTransaction')).toBeInTheDocument();
    });

    it('calls submit function when "submit" button is clicked', async () => {
        const submitMock = jest.fn();

        render(
            <ApiErrorCard
                leaveRoute="/"
                submit={{ action: submitMock, text: 'Submit' }}
            />
        );

        fireEvent.click(screen.getByText('Submit'));

        await waitFor(() => {
            expect(submitMock).toHaveBeenCalledTimes(1);
        });
    });

    it('navigates to correct route when "leaveTransaction" button is clicked', async () => {
        render(
            <ApiErrorCard
                leaveRoute="/policies/ABC/123/policy/premiums"
                submit={{ action: () => {}, text: 'Submit' }}
            />
        );

        fireEvent.click(screen.getByText('leaveTransaction'));

        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith(
                '/policies/ABC/123/policy/premiums'
            );
        });
    });

    it('displays correct subtitle with help desk link', () => {
        render(
            <ApiErrorCard
                leaveRoute="/"
                submit={{ action: () => {}, text: 'Submit' }}
            />
        );

        expect(screen.getByText('helpDesk.text')).toHaveAttribute(
            'href',
            'helpDesk.link'
        );
    });
});
