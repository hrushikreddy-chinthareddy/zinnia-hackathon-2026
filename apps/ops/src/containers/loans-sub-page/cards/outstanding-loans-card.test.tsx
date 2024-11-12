import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PopoverTest } from '@deps/jest/constants/test-id-constants';
import { LoanSegment } from '@deps/models/policy/sor-policy';

import OutstandingLoansCard from './outstanding-loans-card';

const currency = 'USD';
const loanSegment = {
    segmentId: '1',
    loanBalance: 1000,
    startDate: '2023-01-01',
    loanAccruedInterest: 100,
    loanInterestRate: 0.05,
};
const loanSegments = [loanSegment] as LoanSegment[];

const mockT = (key: string, values?: Record<string, string>) => {
    if (values) {
        return `${key} ${Object.values(values).join(', ')}`;
    }
    return key;
};

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: mockT,
    }),
}));

describe('OutstandingLoansCard', () => {
    it('renders the active card with an active loan', () => {
        render(<OutstandingLoansCard currency={currency} lastLoanInterestDueDate="2023-03-01" loanSegments={loanSegments} />);

        expect(screen.getByText('headline')).toBeInTheDocument();

        expect(screen.getByText('Loanbalance')).toBeInTheDocument();
        expect(screen.getByText('$1,000.00')).toBeInTheDocument();
        expect(screen.getByText('loanStartDate 1/1/2023')).toBeInTheDocument();
        expect(screen.getByText('ytdInterest')).toBeInTheDocument();
        expect(screen.getByText('$100.00')).toBeInTheDocument();
        expect(screen.getByText('interestDate 3/1/2023')).toBeInTheDocument();
        expect(screen.getByText('Interestrate')).toBeInTheDocument();
        expect(screen.getByText('5%')).toBeInTheDocument();

        expect(screen.getByText('additionalLoanInformation')).toBeInTheDocument();

        expect(screen.queryByText('loanNumber 1')).not.toBeInTheDocument();
    });

    it('renders the inactive card with no active loans', () => {
        render(<OutstandingLoansCard currency={currency} loanSegments={[]} />);

        expect(screen.getByText('headline')).toBeInTheDocument();

        expect(screen.getByText('inactiveCard')).toBeInTheDocument();
    });

    it('handles empty values and displays error strings', () => {
        const emptyLoanSegments = [
            {
                ...loanSegment,
                startDate: undefined,
                loanAccruedInterest: undefined,
            },
        ] as LoanSegment[];

        render(<OutstandingLoansCard currency={currency} loanSegments={emptyLoanSegments} />);

        expect(screen.getByText('headline')).toBeInTheDocument();

        expect(screen.queryByText('loanStartDate')).not.toBeInTheDocument();
        expect(screen.getByText('ytdInterest')).toBeInTheDocument();
        expect(screen.getByText('--')).toBeInTheDocument();
        expect(screen.queryByText('interestDate')).not.toBeInTheDocument();
    });

    it('renders the inactive card when active loan has a balance of $0', () => {
        const noBalanceLoanSegment = [
            {
                ...loanSegment,
                loanBalance: 0,
            },
        ] as LoanSegment[];

        render(<OutstandingLoansCard currency={currency} loanSegments={noBalanceLoanSegment} />);

        expect(screen.getByText('headline')).toBeInTheDocument();

        expect(screen.getByText('inactiveCard')).toBeInTheDocument();
    });

    it('displays the loan labels on active cards if more than one active loan', () => {
        const multipleLoanSegments = [
            loanSegment,
            {
                segmentId: 2,
                loanBalance: 2000,
                startDate: '2023-02-01',
                loanAccruedInterest: 150,
                loanInterestRate: 6,
            },
        ] as LoanSegment[];

        render(<OutstandingLoansCard currency={currency} lastLoanInterestDueDate="2023-03-01" loanSegments={multipleLoanSegments} />);

        expect(screen.getByText('headline')).toBeInTheDocument();

        expect(screen.getByText('loanNumber 1')).toBeInTheDocument();
        expect(screen.getByText('loanNumber 2')).toBeInTheDocument();
    });

    it('displays tooltips for loan interest rate', async () => {
        render(<OutstandingLoansCard currency={currency} loanSegments={loanSegments} lastLoanInterestDueDate="2023-03-01" />);

        const tooltip = screen.getByTestId(PopoverTest.Popover);

        userEvent.click(tooltip);

        const tooltipTitle = await screen.findByText('interestRate');
        expect(tooltipTitle).toBeInTheDocument();

        const tooltipBody = await screen.findByText('interestRateTooltip');
        expect(tooltipBody).toBeInTheDocument();
    });
});
