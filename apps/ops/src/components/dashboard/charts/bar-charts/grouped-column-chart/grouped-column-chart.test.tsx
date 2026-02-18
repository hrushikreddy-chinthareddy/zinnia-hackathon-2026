import { render } from '@testing-library/react';

import { GroupedColumnsChart } from '@deps/components/dashboard/charts/bar-charts/grouped-column-chart/grouped-column-chart';

const mockHighchartsReact = jest.fn((_props: unknown) => null);

jest.mock('highcharts-react-official', () => ({
    __esModule: true,
    default: (props: any) => mockHighchartsReact(props),
}));

describe('GroupedColumnsChart', () => {
    beforeEach(() => {
        mockHighchartsReact.mockClear();
    });

    it('passes stacking options when provided', () => {
        render(
            <GroupedColumnsChart
                categories={['A']}
                series={[{ name: 'Task 1', data: [10], stack: 'tasks' }]}
                stacking="normal"
            />
        );

        const call = mockHighchartsReact.mock.calls[0]?.[0] as
            | { options: any }
            | undefined;
        expect(call).toBeDefined();
        expect(call?.options?.plotOptions?.column?.stacking).toBe('normal');
        expect(call?.options?.series?.[0]?.stack).toBe('tasks');
    });

    it('omits stacking when not provided', () => {
        render(
            <GroupedColumnsChart
                categories={['A']}
                series={[{ name: 'Task 1', data: [10] }]}
            />
        );

        const call = mockHighchartsReact.mock.calls[0]?.[0] as
            | { options: any }
            | undefined;
        expect(call).toBeDefined();
        expect(call?.options?.plotOptions?.column?.stacking).toBeUndefined();
    });
});
