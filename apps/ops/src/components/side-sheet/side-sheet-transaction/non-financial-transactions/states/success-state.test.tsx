import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import {
    NonFinancialTransactionActions,
    NonFinancialTransactions,
} from '@deps/queries/api/bpm-non-financial';

import SuccessState from './success-state';

// Mocks
jest.mock('next/router', () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

const defaultProps = {
    action: NonFinancialTransactionActions.Add,
    isNigo: false,
    name: 'John Doe',
    onCancel: jest.fn(),
    transaction: NonFinancialTransactions.Address,
    type: 'Permanent',
    caseId: '123',
};

describe('SuccessState', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders NIGO state with correct title, subtitle, and close CTA', () => {
        render(<SuccessState {...defaultProps} isNigo={true} />);
        expect(screen.getByText('title.submitted')).toBeInTheDocument();
        expect(screen.getByText('subtitle.nigo')).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'general.close' })
        ).toBeInTheDocument();
    });

    it('renders success state with subtitle, title, and secondary CTA', () => {
        render(<SuccessState {...defaultProps} isNigo={false} />);
        expect(screen.getByText('title.success')).toBeInTheDocument();
        expect(screen.getByText('subtitle.default.1')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'cta' })).toBeInTheDocument();
    });

    it('calls onCancel when secondary CTA is clicked', () => {
        render(<SuccessState {...defaultProps} isNigo={false} />);
        fireEvent.click(screen.getByText('general.close'));
        expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    it('navigates to case page when main CTA is clicked and caseId is provided', () => {
        const mockPush = jest.fn();
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        jest.spyOn(require('next/router'), 'useRouter').mockReturnValue({
            push: mockPush,
        });
        render(<SuccessState {...defaultProps} isNigo={false} />);
        const mainCta = screen.getByRole('link', { name: 'cta' });
        fireEvent.click(mainCta);
        expect(mockPush).toHaveBeenCalledWith('/cases/123/progress');
    });
});
