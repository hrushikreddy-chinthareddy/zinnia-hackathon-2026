import { render } from '@testing-library/react';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { TasksVolume } from '@deps/components/dashboard/sections/tasks-volume/tasks-volume';

jest.mock(
    '@deps/components/dashboard/sections/tasks-volume/tab-content/chart/tasks-volume-chart',
    () => ({
        TasksVolumeChart: () => <div>Chart</div>,
    })
);

jest.mock(
    '@deps/components/dashboard/sections/tasks-volume/tab-content/table/tasks-volume-table',
    () => ({
        TasksVolumeTable: () => <div>Table</div>,
    })
);

jest.mock(
    '@deps/components/dashboard/sections/tasks-volume/context/tasks-volume-provider',
    () => ({
        TasksVolumeProvider: ({ children }: { children: React.ReactNode }) => (
            <div>{children}</div>
        ),
    })
);

describe('TasksVolume', () => {
    it('applies shared tab content class to tabs', () => {
        const { container } = render(<TasksVolume />);

        const tabContents = container.querySelectorAll(
            `.${sharedStyles.tabContent}`
        );
        expect(tabContents).toHaveLength(2);
    });
});
