import { render, screen } from '@testing-library/react';
import React from 'react';

import { RetentionAttritionPieChart } from './retention-attrition-pie-chart';

const mockUseRetentionAttrition = jest.fn();

jest.mock('../context/retention-attrition-context', () => ({
    useRetentionAttrition: () => mockUseRetentionAttrition(),
}));

jest.mock('@deps/components/dashboard/charts/pie-charts/pie-chart', () => ({
    PieChart: () => <div data-testid="pie-chart" />,
}));

jest.mock('@deps/components/overlay-loader/overlay-loader', () => ({
    BlurOverlayLoader: ({
        children,
        loading,
    }: {
        children: React.ReactNode;
        loading: boolean;
    }) => (
        <div data-testid="blur-overlay-loader" data-loading={loading}>
            {children}
        </div>
    ),
}));

describe('RetentionAttritionPieChart', () => {
    it('should return null when no data and not loading', () => {
        mockUseRetentionAttrition.mockReturnValue({
            pieSeries: [{ name: 'Retention & Attrition', data: [] }],
            retentionAttritionPieDataFetching: false,
            pieInformation: { title: '', description: '' },
        });

        const { container } = render(<RetentionAttritionPieChart />);

        expect(container.firstChild).toBeNull();
    });

    it('should render loader when loading even without data', () => {
        mockUseRetentionAttrition.mockReturnValue({
            pieSeries: [{ name: 'Retention & Attrition', data: [] }],
            retentionAttritionPieDataFetching: true,
            pieInformation: { title: '', description: '' },
        });

        render(<RetentionAttritionPieChart />);

        expect(screen.getByTestId('blur-overlay-loader')).toBeInTheDocument();
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    it('should render chart and information when has data', () => {
        mockUseRetentionAttrition.mockReturnValue({
            pieSeries: [
                {
                    name: 'Retention & Attrition',
                    data: [
                        { name: 'Retention', y: 60 },
                        { name: 'Attrition', y: 40 },
                    ],
                },
            ],
            retentionAttritionPieDataFetching: false,
            pieInformation: {
                title: '60 %',
                description: 'Retention past 12 months',
            },
        });

        render(<RetentionAttritionPieChart />);

        expect(screen.getByText('60 %')).toBeInTheDocument();
        expect(
            screen.getByText('Retention past 12 months')
        ).toBeInTheDocument();
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });
});
