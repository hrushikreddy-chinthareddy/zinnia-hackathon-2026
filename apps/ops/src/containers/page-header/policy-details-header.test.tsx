import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { PopoverTest } from '@deps/jest/constants/test-id-constants';
import { mockPolicy } from '@deps/services/mocks/sor-policy-iul';

import PolicyDetailsHeader from './policy-details-header';

jest.mock('next/router', () => ({
    useRouter: jest.fn(() => ({
        pathname: '/',
    })),
}));

jest.mock('@deps/hooks/useBreadcrumbs', () =>
    jest.fn(() => ({
        breadcrumb: {
            url: 'url',
            h1: 'h1',
            text: 'text',
        },
    }))
);

afterEach(cleanup);

const renderWithQueryClient = (ui: React.ReactElement) => {
    const queryClient = new QueryClient();
    return render(
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
};

describe('verify correct labels and tooltip values are present', () => {
    it('should contain correct labels', () => {
        renderWithQueryClient(
            <PolicyDetailsHeader policy={new PolicyDetails(mockPolicy)} />
        );

        expect(screen.getByText('Basedeathbenefit')).toBeInTheDocument();
        expect(screen.getByText('Accountvalue')).toBeInTheDocument();
        expect(screen.getByText('Netsurrendervalue')).toBeInTheDocument();
        expect(screen.getByText('Costbasis')).toBeInTheDocument();
    });

    it('should correctly display the death benefit tooltip', async () => {
        renderWithQueryClient(
            <PolicyDetailsHeader policy={new PolicyDetails(mockPolicy)} />
        );

        const allPopovers = screen.getAllByTestId(PopoverTest.Popover);

        fireEvent.click(allPopovers[0]);

        const foundPopoverTitle = await screen.findByTestId(PopoverTest.Title);
        const foundPopoverBody = await screen.findByTestId(PopoverTest.Body);

        expect(foundPopoverTitle).toBeInTheDocument();
        expect(foundPopoverTitle).toHaveClass('label-lg mb-1');
        expect('baseDeathBenefit').toBeInTheDocument;

        expect(foundPopoverBody).toBeInTheDocument();
        expect(foundPopoverBody).toHaveClass('body-sm');
        expect('baseDeathBenefitTooltip').toBeInTheDocument;
    });

    it('should correctly display the account value tooltip', async () => {
        renderWithQueryClient(
            <PolicyDetailsHeader policy={new PolicyDetails(mockPolicy)} />
        );

        const allPopovers = screen.getAllByTestId(PopoverTest.Popover);

        fireEvent.click(allPopovers[1]);

        const foundPopoverTitle = await screen.findByTestId(PopoverTest.Title);
        const foundPopoverBody = await screen.findByTestId(PopoverTest.Body);

        expect(foundPopoverTitle).toBeInTheDocument();
        expect(foundPopoverTitle).toHaveClass('label-lg mb-1');
        expect('accountValue').toBeInTheDocument;

        expect(foundPopoverBody).toBeInTheDocument();
        expect(foundPopoverBody).toHaveClass('body-sm');
        expect('accountValueTooltip').toBeInTheDocument;
    });

    it('should correctly display the net surrender value tooltip', async () => {
        renderWithQueryClient(
            <PolicyDetailsHeader policy={new PolicyDetails(mockPolicy)} />
        );

        const allPopovers = screen.getAllByTestId(PopoverTest.Popover);

        fireEvent.click(allPopovers[2]);

        const foundPopoverTitle = await screen.findByTestId(PopoverTest.Title);
        const foundPopoverBody = await screen.findByTestId(PopoverTest.Body);

        expect(foundPopoverTitle).toBeInTheDocument();
        expect(foundPopoverTitle).toHaveClass('label-lg mb-1');
        expect('netSurrenderValue').toBeInTheDocument;

        expect(foundPopoverBody).toBeInTheDocument();
        expect(foundPopoverBody).toHaveClass('body-sm');
        expect('netSurrenderValueTooltip').toBeInTheDocument;
    });

    it('should correctly display the cost basis tooltip', async () => {
        renderWithQueryClient(
            <PolicyDetailsHeader policy={new PolicyDetails(mockPolicy)} />
        );

        const allPopovers = screen.getAllByTestId(PopoverTest.Popover);

        fireEvent.click(allPopovers[3]);

        const foundPopoverTitle = await screen.findByTestId(PopoverTest.Title);
        const foundPopoverBody = await screen.findByTestId(PopoverTest.Body);

        expect(foundPopoverTitle).toBeInTheDocument();
        expect(foundPopoverTitle).toHaveClass('label-lg mb-1');
        expect('costBasis').toBeInTheDocument;

        expect(foundPopoverBody).toBeInTheDocument();
        expect(foundPopoverBody).toHaveClass('body-sm');
        expect('costBasisTooltip').toBeInTheDocument;
    });
});
