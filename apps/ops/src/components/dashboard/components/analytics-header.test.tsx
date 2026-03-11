import { render, screen } from '@testing-library/react';

import AnalyticsHeader from './analytics-header';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('AnalyticsHeader', () => {
    const baseProps = {
        isLoading: false,
        total: 10,
        chartName: 'chartName',
        titleToolTip: undefined,
    };

    it('renders all fields and labels', () => {
        render(<AnalyticsHeader {...baseProps} />);
        expect(
            screen.getByText(`allFields.${baseProps.chartName}Title`)
        ).toBeInTheDocument();
        expect(
            screen.getByText(`allFields.${baseProps.chartName}Description`)
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                `${baseProps.total} allFields.${baseProps.chartName}Unit`
            )
        ).toBeInTheDocument();
    });

    it('removes blur when loading finishes', () => {
        const { rerender } = render(
            <AnalyticsHeader {...baseProps} isLoading={true} />
        );

        const subtitle = screen.getByTestId('subtitle');
        expect(subtitle).toHaveClass('blur');

        rerender(<AnalyticsHeader {...baseProps} />);
        expect(subtitle).not.toHaveClass('blur');
    });

    it('adds tooltip to the header', async () => {
        const titleToolTip = (
            <>
                <p>Testing tooltip</p>
            </>
        );

        const { container } = render(
            <AnalyticsHeader {...baseProps} titleToolTip={titleToolTip} />
        );

        const trigger = container.querySelector('.tooltip-primary');
        expect(trigger).toBeInTheDocument();
    });
});
