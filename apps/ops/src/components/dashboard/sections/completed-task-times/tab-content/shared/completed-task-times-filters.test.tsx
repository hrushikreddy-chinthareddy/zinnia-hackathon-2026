import { render } from '@testing-library/react';

import { CompletedTaskTimesFilters } from '@deps/components/dashboard/sections/completed-task-times/tab-content/shared/completed-task-times-filters';

const mockUseCompletedTaskTimes = jest.fn();
const mockSelect = jest.fn((_props: unknown) => null);
const mockTimeFilter = jest.fn((_props: unknown) => null);

jest.mock(
    '@deps/components/dashboard/sections/completed-task-times/context/completed-task-times-context',
    () => ({
        useCompletedTaskTimes: () => mockUseCompletedTaskTimes(),
    })
);

jest.mock('@deps/components/select/select', () => ({
    __esModule: true,
    default: (props: any) => mockSelect(props),
}));

jest.mock('@deps/components/dashboard/filters/time-filter/time-filter', () => ({
    TimeFilter: (props: any) => mockTimeFilter(props),
}));

const mockT = jest.fn((key: string) => {
    if (key === 'allFields.groupBy') return 'Group by';
    if (key === 'allFields.caseType') return 'Case type';
    if (key === 'allFields.all') return 'All';
    return key;
});

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT,
    }),
}));

describe('CompletedTaskTimesFilters', () => {
    beforeEach(() => {
        mockSelect.mockClear();
        mockTimeFilter.mockClear();
        mockUseCompletedTaskTimes.mockReturnValue({
            timeframeRadio: '12M',
            handleTimeframeRadioChange: jest.fn(),
            timerange: { from: '2025-01-01', to: '2025-02-01' },
            handleRangeChange: jest.fn(),
        });
    });

    it('does not render group by select when showGroupBy is false', () => {
        render(<CompletedTaskTimesFilters />);
        expect(mockSelect).not.toHaveBeenCalled();
        expect(mockTimeFilter).toHaveBeenCalled();
    });
});
