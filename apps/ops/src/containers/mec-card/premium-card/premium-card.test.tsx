import { cleanup, render, screen } from '@testing-library/react';

import { PremiumCardTest } from '@deps/jest/constants/test-id-constants';

import PremiumCard from './premium-card';

afterEach(cleanup);

describe('PremiumCard', () => {
    const mockProps = {
        title: 'Premium Card',
        cardLabel: 'Card Label',
        cardLabelTooltip: 'Card Label Tooltip',
        compareValue: 50,
        total: 100,
        progressBarLabel: 'Progress Bar Label',
        progressBarLabelPopover: 'Progress Bar Label Popover',
    };

    it('renders the PremiumCard component correctly', () => {
        render(<PremiumCard {...mockProps} />);

        expect(
            screen.getByTestId(PremiumCardTest.PREMIUMCARD)
        ).toBeInTheDocument();
        expect(screen.getByTestId(PremiumCardTest.FOOTER)).toBeInTheDocument();
    });
});
