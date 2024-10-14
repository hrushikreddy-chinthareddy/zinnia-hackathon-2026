import { render, screen, cleanup, fireEvent } from '@testing-library/react';

import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { PopoverTest } from '@deps/jest/constants/test-id-constants';
import { mockPolicy } from '@deps/services/mocks/sor-policy-iul';

import InsuredCard from './covered-parties-card';

jest.mock('next/router', () => ({
    useRouter: jest.fn(() => ({
        pathname: '/',
    })),
}));

afterEach(cleanup);

let mockPolicyDetails: PolicyDetails;
describe('verify correct tooltip values are present', () => {
    beforeAll(() => {
        mockPolicyDetails = new PolicyDetails(mockPolicy);
    });
    it('should contain correct labels', () => {
        render(<InsuredCard policy={mockPolicyDetails} />);

        expect(screen.getByText('Fullname')).toBeInTheDocument();
        expect(screen.getByText('Riskclass')).toBeInTheDocument();
        expect(screen.getByText('Currentage')).toBeInTheDocument();
        expect(screen.getByText('Ageatissue')).toBeInTheDocument();
    });

    it('should contain the correct tooltip values', async () => {
        render(<InsuredCard policy={mockPolicyDetails} />);

        const allPopovers = screen.getAllByTestId(PopoverTest.Popover);

        fireEvent.click(allPopovers[0]);

        const foundPopoverTitle = await screen.findByTestId(PopoverTest.Title);
        const foundPopoverBody = await screen.findByTestId(PopoverTest.Body);

        expect(foundPopoverTitle).toBeInTheDocument();
        expect(foundPopoverTitle).toHaveClass('label-lg mb-1');
        expect('policy.detailCards.insured.riskClass').toBeInTheDocument;

        expect(foundPopoverBody).toBeInTheDocument();
        expect(foundPopoverBody).toHaveClass('body-sm');
        expect('policy.detailCards.insured.riskClassTooltip').toBeInTheDocument;
    });
});
