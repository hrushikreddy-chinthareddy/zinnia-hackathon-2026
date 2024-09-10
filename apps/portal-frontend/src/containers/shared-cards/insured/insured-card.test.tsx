import { render, screen, cleanup, fireEvent } from '@testing-library/react';

import { PopoverTest } from '@deps/jest/constants/test-id-constants';

import InsuredCard from './insured-card';
import { InsuredCardData } from './insured-card.helper';

jest.mock('next/router', () => ({
    useRouter: jest.fn(() => ({
        pathname: '/',
    })),
}));

const mockInsuredCardData: InsuredCardData = {
    ageAtIssue: '20 years old',
    currentAge: '20 years old',
    fullName: {
        href: '/policies/AU05202414/people/651f1b7d4df9c91ba1005fcf',
        text: 'Karen Anne Jones ',
    },
    riskClass: 'Preferred Non-Tobacco',
};

afterEach(cleanup);

describe('verify correct tooltip values are present', () => {
    it('should contain correct labels', () => {
        render(<InsuredCard insuredCardData={mockInsuredCardData} />);

        expect(screen.getByText('Fullname')).toBeInTheDocument();
        expect(screen.getByText('Riskclass')).toBeInTheDocument();
        expect(screen.getByText('Currentage')).toBeInTheDocument();
        expect(screen.getByText('Ageatissue')).toBeInTheDocument();
    });

    it('should contain the correct tooltip values', async () => {
        render(<InsuredCard insuredCardData={mockInsuredCardData} />);

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
