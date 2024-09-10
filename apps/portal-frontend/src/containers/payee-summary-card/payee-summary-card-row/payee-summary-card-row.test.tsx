import { composeStories } from '@storybook/react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

import PayeeSummaryCardRow from './payee-summary-card-row';
import * as stories from './payee-summary-card-row.stories';

expect.extend(toHaveNoViolations);

describe('PayeeSummaryCardRow Component', () => {
    const { Default } = composeStories(stories);

    const defaultProps = {
        label: 'Label',
        amount: '100',
    };

    it('renders label and amount correctly', () => {
        const { getByText } = render(<PayeeSummaryCardRow {...defaultProps} />);
        const labelElement = getByText('Label');
        const amountElement = getByText('100');
        expect(labelElement).toBeInTheDocument();
        expect(amountElement).toBeInTheDocument();
    });

    it('renders percentage when provided', () => {
        const propsWithPercentage = {
            ...defaultProps,
            percentage: '50%',
        };
        const { getByText } = render(<PayeeSummaryCardRow {...propsWithPercentage} />);
        const percentageElement = getByText('50%');
        expect(percentageElement).toBeInTheDocument();
    });

    it('renders value variant if isSumTotalRow is true', () => {
        const propsWithSumTotalRow = {
            ...defaultProps,
            isSumTotalRow: true,
        };
        const { getByText } = render(<PayeeSummaryCardRow {...propsWithSumTotalRow} />);
        const amountElement = getByText('100');
        expect(amountElement).toHaveClass('tracking-normal no-underline font-primary text-xl font-medium leading-[24px]');
    });

    it('renders body variant if isSumTotalRow is false', () => {
        const { getByText } = render(<PayeeSummaryCardRow {...defaultProps} />);
        const amountElement = getByText('100');
        expect(amountElement).toHaveClass('tracking-normal no-underline font-secondary text-base font-normal leading-[24px]');
    });

    it('Should have no accessibility violations', async () => {
        const { container } = render(<Default />);

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
