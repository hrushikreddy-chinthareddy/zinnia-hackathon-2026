import { render, screen } from '@testing-library/react';

import { TasksVolumeChart } from '@deps/components/dashboard/sections/tasks-volume/tab-content/chart/tasks-volume-chart';
import { TaskStatus } from '@deps/components/dashboard/sections/tasks-volume/utils';

const mockUseTasksVolume = jest.fn();
const mockUseDashboardStore = jest.fn();

jest.mock(
    '@deps/components/dashboard/sections/tasks-volume/context/tasks-volume-context',
    () => ({
        useTasksVolume: () => mockUseTasksVolume(),
    })
);

jest.mock('@deps/store/store', () => ({
    useDashboardStore: (selector: any) => selector(mockUseDashboardStore()),
}));

const mockT = jest.fn((key: string, options?: { status?: string }) => {
    if (key === 'allFields.all') return 'All';
    if (key === 'allFields.open') return 'Open';
    if (key === 'allFields.taskVolumeEmptyStateAll')
        return "Looks like there aren't any tasks.";
    if (key === 'allFields.taskVolumeEmptyStateStatus')
        return `Looks like there aren't any ${options?.status} tasks.`;
    if (key === 'allFields.exportCSV') return 'Export to CSV';
    return key;
});

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT,
    }),
}));

jest.mock(
    '@deps/components/dashboard/sections/tasks-volume/tab-content/shared/tasks-volume-header',
    () => ({
        TasksVolumeHeader: () => <div>Header</div>,
    })
);

jest.mock(
    '@deps/components/dashboard/sections/tasks-volume/tab-content/shared/tasks-volume-filters',
    () => ({
        TasksVolumeFilters: () => <div>Filters</div>,
    })
);

describe('TasksVolumeChart', () => {
    beforeEach(() => {
        mockT.mockClear();
        mockUseDashboardStore.mockReturnValue({ selectedCarriers: {} });
    });

    it('renders the empty state for all statuses', () => {
        mockUseTasksVolume.mockReturnValue({
            taskVolumeData: [],
            taskVolumeDataFetching: false,
            taskVolumeDataLoading: false,
            taskVolumeDataError: false,
            selectedStatus: [],
            timerange: { from: '2025-01-01', to: '2025-01-02' },
        });

        render(<TasksVolumeChart />);

        expect(
            screen.getByText("Looks like there aren't any tasks.")
        ).toBeInTheDocument();
    });

    it('renders the empty state for a specific status', () => {
        mockUseTasksVolume.mockReturnValue({
            taskVolumeData: [],
            taskVolumeDataFetching: false,
            taskVolumeDataLoading: false,
            taskVolumeDataError: false,
            selectedStatus: [TaskStatus.OPEN],
            timerange: { from: '2025-01-01', to: '2025-01-02' },
        });

        render(<TasksVolumeChart />);

        expect(
            screen.getByText("Looks like there aren't any Open tasks.")
        ).toBeInTheDocument();
    });
});
