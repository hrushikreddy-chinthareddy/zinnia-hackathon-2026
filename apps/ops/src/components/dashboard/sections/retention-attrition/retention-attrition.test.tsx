import { render, screen } from '@testing-library/react';
import React from 'react';

import { RetentionAttrition } from './retention-attrition';

jest.mock('./chart/retention-attrition-pie-chart', () => ({
    RetentionAttritionPieChart: () => (
        <div data-testid="retention-attrition-pie-chart" />
    ),
}));

jest.mock('./table/retention-attrition-table', () => ({
    RetentionAttritionTable: () => (
        <div data-testid="retention-attrition-table" />
    ),
}));

jest.mock('./context/retention-attrition-provider', () => ({
    RetentionAttritionProvider: ({
        children,
    }: {
        children: React.ReactNode;
    }) => <div data-testid="retention-attrition-provider">{children}</div>,
}));

describe('RetentionAttrition', () => {
    it('should render RetentionAttritionProvider', () => {
        render(<RetentionAttrition />);

        expect(
            screen.getByTestId('retention-attrition-provider')
        ).toBeInTheDocument();
    });

    it('should render pie chart and table inside provider', () => {
        render(<RetentionAttrition />);

        expect(
            screen.getByTestId('retention-attrition-pie-chart')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('retention-attrition-table')
        ).toBeInTheDocument();
    });

    it('should render container with retention attrition styles', () => {
        const { container } = render(<RetentionAttrition />);

        const wrapper = container.querySelector(
            '[class*="retentionAttritionContainer"]'
        );
        expect(wrapper).toBeInTheDocument();
    });
});
