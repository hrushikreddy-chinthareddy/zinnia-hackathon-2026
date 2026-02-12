import { render } from '@testing-library/react';

import { CompletedTaskTimesChart } from '@deps/components/dashboard/sections/completed-task-times/tab-content/chart/completed-task-times-chart';

const mockUseCompletedTaskTimes = jest.fn();
const mockHighchartsReact = jest.fn((_props: unknown) => null);

jest.mock(
    '@deps/components/dashboard/sections/completed-task-times/context/completed-task-times-context',
    () => ({
        useCompletedTaskTimes: () => mockUseCompletedTaskTimes(),
    })
);

jest.mock('highcharts-react-official', () => ({
    __esModule: true,
    default: (props: any) => mockHighchartsReact(props),
}));

jest.mock(
    '@deps/components/dashboard/sections/completed-task-times/tab-content/shared/completed-task-times-filters',
    () => ({
        CompletedTaskTimesFilters: () => <div>Filters</div>,
    })
);

jest.mock(
    '@deps/components/dashboard/sections/completed-task-times/tab-content/shared/completed-task-times-header',
    () => ({
        CompletedTaskTimesHeader: () => <div>Header</div>,
    })
);

const mockT = jest.fn((key: string) => {
    if (key === 'allFields.minutesLabel') return 'minutes';
    if (key === 'allFields.hoursLabel') return 'hours';
    if (key === 'allFields.daysLabel') return 'days';
    if (key === 'allFields.monthsLabel') return 'months';
    if (key === 'allFields.completedTaskTimesXAxisLabel')
        return 'Processing time';
    if (key === 'allFields.completedTaskTimesYAxisLabel') return 'Case type';
    return key;
});

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT,
    }),
}));

describe('CompletedTaskTimesChart tooltip formatting', () => {
    beforeEach(() => {
        mockHighchartsReact.mockClear();
        mockUseCompletedTaskTimes.mockReturnValue({
            completedTaskTimeData: [
                {
                    caseType: 'Claims',
                    secondMedian: 3600,
                    totalTasks: 10,
                    tasks: [
                        {
                            taskName: 'Review',
                            secondMedian: 1800,
                            count: 2,
                        },
                        {
                            taskName: 'Approve',
                            secondMedian: 90000,
                            count: 1,
                        },
                    ],
                },
            ],
            completedTaskTimeDataFetching: false,
            completedTaskTimeDataLoading: false,
            completedTaskTimeDataError: false,
        });
    });

    const getTooltipFormatter = () => {
        render(<CompletedTaskTimesChart />);
        const call = mockHighchartsReact.mock.calls[0]?.[0] as
            | { options: any }
            | undefined;
        return call?.options?.tooltip?.formatter as
            | Highcharts.TooltipFormatterCallbackFunction
            | undefined;
    };

    it('provides a tooltip formatter function', () => {
        const formatter = getTooltipFormatter();
        expect(typeof formatter).toBe('function');
    });
});
