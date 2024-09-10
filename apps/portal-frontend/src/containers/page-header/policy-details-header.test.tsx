import { render, screen, cleanup, fireEvent } from '@testing-library/react';

import { PopoverTest } from '@deps/jest/constants/test-id-constants';

import PolicyDetailsHeader from './policy-details-header';

jest.mock('next/router', () => ({
    useRouter: jest.fn(() => ({
        pathname: '/',
    })),
}));

afterEach(cleanup);

const mockMeta = {
    currency: 'USD',
    policyNumber: 'JJ22045156',
};

const mockPolicyDetailsHeaderData = {
    accountValue: 353.792897,
    costBasis: 396,
    faceValue: 100000,
    loansTaken: 0,
    loansTotalAmount: 0,
    netSurrenderValue: 353.792897,
    premiums: 396,
    premiumsYtd: 396,
    withdrawalsTaken: 0,
    withdrawalTotalAmount: 0,
};

describe('verify correct labels and tooltip values are present', () => {
    it('should contain correct labels', () => {
        render(<PolicyDetailsHeader meta={mockMeta} policyDetailsHeaderData={mockPolicyDetailsHeaderData} />);

        expect(screen.getByText('Policy.detailcards.policydetails.basedeathbenefit')).toBeInTheDocument();
        expect(screen.getByText('Policy.detailcards.policydetails.accountvalue')).toBeInTheDocument();
        expect(screen.getByText('Policy.detailcards.policydetails.netsurrendervalue')).toBeInTheDocument();
        expect(screen.getByText('Policy.detailcards.policydetails.costbasis')).toBeInTheDocument();
    });

    it('should correctly display the death benefit tooltip', async () => {
        render(<PolicyDetailsHeader meta={mockMeta} policyDetailsHeaderData={mockPolicyDetailsHeaderData} />);

        const allPopovers = screen.getAllByTestId(PopoverTest.Popover);

        fireEvent.click(allPopovers[0]);

        const foundPopoverTitle = await screen.findByTestId(PopoverTest.Title);
        const foundPopoverBody = await screen.findByTestId(PopoverTest.Body);

        expect(foundPopoverTitle).toBeInTheDocument();
        expect(foundPopoverTitle).toHaveClass('label-lg mb-1');
        expect('policy.detailCards.policyDetails.baseDeathBenefit').toBeInTheDocument;

        expect(foundPopoverBody).toBeInTheDocument();
        expect(foundPopoverBody).toHaveClass('body-sm');
        expect('policy.detailCards.policyDetails.baseDeathBenefitTooltip').toBeInTheDocument;
    });

    it('should correctly display the account value tooltip', async () => {
        render(<PolicyDetailsHeader meta={mockMeta} policyDetailsHeaderData={mockPolicyDetailsHeaderData} />);

        const allPopovers = screen.getAllByTestId(PopoverTest.Popover);

        fireEvent.click(allPopovers[1]);

        const foundPopoverTitle = await screen.findByTestId(PopoverTest.Title);
        const foundPopoverBody = await screen.findByTestId(PopoverTest.Body);

        expect(foundPopoverTitle).toBeInTheDocument();
        expect(foundPopoverTitle).toHaveClass('label-lg mb-1');
        expect('policy.detailCards.policyDetails.accountValue').toBeInTheDocument;

        expect(foundPopoverBody).toBeInTheDocument();
        expect(foundPopoverBody).toHaveClass('body-sm');
        expect('policy.detailCards.policyDetails.accountValueTooltip').toBeInTheDocument;
    });

    it('should correctly display the net surrender value tooltip', async () => {
        render(<PolicyDetailsHeader meta={mockMeta} policyDetailsHeaderData={mockPolicyDetailsHeaderData} />);

        const allPopovers = screen.getAllByTestId(PopoverTest.Popover);

        fireEvent.click(allPopovers[2]);

        const foundPopoverTitle = await screen.findByTestId(PopoverTest.Title);
        const foundPopoverBody = await screen.findByTestId(PopoverTest.Body);

        expect(foundPopoverTitle).toBeInTheDocument();
        expect(foundPopoverTitle).toHaveClass('label-lg mb-1');
        expect('policy.detailCards.policyDetails.netSurrenderValue').toBeInTheDocument;

        expect(foundPopoverBody).toBeInTheDocument();
        expect(foundPopoverBody).toHaveClass('body-sm');
        expect('policy.detailCards.policyDetails.netSurrenderValueTooltip').toBeInTheDocument;
    });

    it('should correctly display the cost basis tooltip', async () => {
        render(<PolicyDetailsHeader meta={mockMeta} policyDetailsHeaderData={mockPolicyDetailsHeaderData} />);

        const allPopovers = screen.getAllByTestId(PopoverTest.Popover);

        fireEvent.click(allPopovers[3]);

        const foundPopoverTitle = await screen.findByTestId(PopoverTest.Title);
        const foundPopoverBody = await screen.findByTestId(PopoverTest.Body);

        expect(foundPopoverTitle).toBeInTheDocument();
        expect(foundPopoverTitle).toHaveClass('label-lg mb-1');
        expect('policy.detailCards.policyDetails.costBasis').toBeInTheDocument;

        expect(foundPopoverBody).toBeInTheDocument();
        expect(foundPopoverBody).toHaveClass('body-sm');
        expect('policy.detailCards.policyDetails.costBasisTooltip').toBeInTheDocument;
    });
});
