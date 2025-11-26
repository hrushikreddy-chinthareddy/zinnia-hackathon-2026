import { fireEvent, render, screen } from '@testing-library/react';

import { PopoverTest } from '@deps/jest/constants/test-id-constants';
import { LoanInterestMethod, LoanValues } from '@zinnia/api-types/types/sor';

import LoanRulesCard from './loan-rules-card';

const mockLoanValues = {
    loanInterestMethod: LoanInterestMethod.ARREARS,
    minimumLoanAmount: 1000,
    maximumLoanAmount: 5000,
} as LoanValues;

const mockCurrency = 'USD';

describe('LoanRulesCard', () => {
    it('should render the card with correct labels and values', () => {
        render(
            <LoanRulesCard
                currency={mockCurrency}
                loanValues={mockLoanValues}
            />
        );

        expect(screen.getByText('headline')).toBeInTheDocument();

        expect(screen.getByText('Minloanamt')).toBeInTheDocument();
        expect(screen.getByText('$1,000.00')).toBeInTheDocument();

        expect(screen.getByText('Maxloanamt')).toBeInTheDocument();
        expect(screen.getByText('$5,000.00')).toBeInTheDocument();

        expect(screen.getByText('Loaninterestmethod')).toBeInTheDocument();
        expect(screen.getByText('Arrears')).toBeInTheDocument();
    });

    it('should handle empty values and display error strings', () => {
        const emptyLoanValues = {
            loanInterestMethod: undefined,
            minLoanAmount: undefined,
            maxLoanAmount: undefined,
        };

        render(
            <LoanRulesCard
                currency={mockCurrency}
                loanValues={emptyLoanValues}
            />
        );

        expect(screen.getByText('Minloanamt')).toBeInTheDocument();
        expect(screen.getByText('$0.00')).toBeInTheDocument();

        expect(screen.getByText('Maxloanamt')).toBeInTheDocument();
        expect(screen.getByText('Loaninterestmethod')).toBeInTheDocument();
        expect(screen.getAllByText('--')).toHaveLength(2);
    });

    it('should display tooltip', async () => {
        render(
            <LoanRulesCard
                currency={mockCurrency}
                loanValues={mockLoanValues}
            />
        );

        const tooltipIcon = screen.getByTestId(PopoverTest.Popover);
        expect(tooltipIcon).toBeInTheDocument();

        fireEvent.click(tooltipIcon);

        expect(
            await screen.findByTestId(PopoverTest.Content)
        ).toBeInTheDocument();
    });
});
