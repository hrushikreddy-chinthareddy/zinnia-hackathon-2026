import { render, screen, act } from '@testing-library/react';

import { LoansTest } from '@deps/jest/constants/test-id-constants';
import { mockPolicy } from '@deps/jest/data/mockPolicy';
import { Status } from '@deps/models/policy/sor-policy';
import * as BpmQueries from '@deps/queries/api/bpm';
import * as ProductRateQueries from '@deps/queries/api/product-rate';

import LoansPageHeaderContainer from './loans-page-header';

jest.mock('next/router', () => ({
    useRouter: jest.fn(() => ({
        pathname: '/',
        events: {
            on: jest.fn(),
            off: jest.fn(),
        },
    })),
}));

jest.mock('@deps/queries/api/bpm');
jest.mock('@deps/queries/api/product-rate');
const mockedLoanEligibility = jest.mocked(BpmQueries.checkEligibilityNewLoan);
const mockedInterestRate = jest.mocked(ProductRateQueries.getLoanInterestRate);
const mockedCreditRate = jest.mocked(ProductRateQueries.getBorrowingInterestRate);

describe('verify correct labels and fields are present', () => {
    beforeEach(() => {
        mockedLoanEligibility.mockResolvedValue(Promise.resolve({ status: 'success' }));
        mockedInterestRate.mockResolvedValue(Promise.resolve(2));
        mockedCreditRate.mockResolvedValue(Promise.resolve(3));
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    // TODO: DEPU-2242 update this unit test to reflect updates made to LoansPageHeaderContainer
    it('should contain correct h1 and loan transaction history texts', async () => {
        await act(async () => {
            render(<LoansPageHeaderContainer loanCarryingBalance={true} policy={mockPolicy} />);
        });

        const allHeaders = screen.getAllByText('transactions.loans.header.loansTitle');
        expect(allHeaders).toHaveLength(2);

        const h1Headers = allHeaders.filter(element => element.tagName.toLowerCase() === 'h1');
        expect(h1Headers).toHaveLength(1); // Assuming only one of them should be an h1
    });

    it('should display the correct fields if a user has no outstanding loans', async () => {
        render(<LoansPageHeaderContainer loanCarryingBalance={false} policy={mockPolicy} />);

        await expect(
            screen.findByText('pageHeader.loans.fields.estimatedNetDeathBenefit', {
                exact: false,
            })
        ).rejects.toThrowError(); // We don't expect this to show up.
        expect(
            await screen.findByText('pageHeader.loans.fields.availableLoanInterestRate', {
                exact: false,
            })
        ).toBeInTheDocument();
        expect(
            await screen.findByText('pageHeader.loans.fields.availableLoanCreditRate', {
                exact: false,
            })
        ).toBeInTheDocument();
    });

    it('should display the correct fields if a user has outstanding loans', async () => {
        const modifiedMockPolicy = {
            ...mockPolicy,
            loanValues: {
                ...mockPolicy.loanValues,
                totalNumberOfLoan: 1,
            },
        };

        render(<LoansPageHeaderContainer loanCarryingBalance={true} policy={modifiedMockPolicy} />);

        expect(
            await screen.findByText('pageHeader.loans.fields.estimatedNetDeathBenefit', {
                exact: false,
            })
        ).toBeInTheDocument();
        await expect(
            screen.findByText('pageHeader.loans.fields.availableLoanInterestRate', {
                exact: false,
            })
        ).rejects.toThrowError();
        await expect(
            screen.findByText('pageHeader.loans.fields.availableLoanCreditRate', {
                exact: false,
            })
        ).rejects.toThrowError();
    });
});

// https://zinnia.atlassian.net/browse/DEPU-1936
describe.skip('verify quick links render appropriately', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should display an enabled start a loan link if a user meets the requirements', async () => {
        mockedLoanEligibility.mockResolvedValueOnce({ status: 'success' });
        mockedInterestRate.mockResolvedValue(Promise.resolve(2));
        mockedCreditRate.mockResolvedValue(Promise.resolve(3));
        const modifiedMockPolicy = {
            ...mockPolicy,
            policyStatus: Status.ACTIVE,
            loanValues: {
                ...mockPolicy.loanValues,
                totalNumberOfLoan: 0,
            },
        };

        render(<LoansPageHeaderContainer loanCarryingBalance={false} policy={modifiedMockPolicy} />);

        const startLoanLink = await screen.findByTestId(LoansTest.START_LOAN_LINK);

        expect(startLoanLink).toBeInTheDocument();
    });

    it.skip('should display a disabled start a loan link if a user does not meet the requirements', async () => {
        mockedLoanEligibility.mockResolvedValueOnce({ status: 500 });
        mockedInterestRate.mockResolvedValue(Promise.resolve(2));
        mockedCreditRate.mockResolvedValue(Promise.resolve(3));
        const modifiedMockPolicy = {
            ...mockPolicy,
        };

        render(<LoansPageHeaderContainer loanCarryingBalance={true} policy={modifiedMockPolicy} />);

        const startLoanDisabledLink = await screen.findByTestId(LoansTest.START_LOAN_LINK_DISABLED);

        expect(startLoanDisabledLink).toBeInTheDocument();
    });
});
