import { IconType, TabContent } from '@zinnia/bloom/components';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import {
    SectionTabNavs,
    SectionTabValues,
} from '@deps/components/dashboard/sections-tab-nav/sections-tab-nav';

import { TasksVolumeProvider } from './context/tasks-volume-provider';
import { TasksVolumeChart } from './tab-content/chart/tasks-volume-chart';
import { TasksVolumeTable } from './tab-content/table/tasks-volume-table';

export const TasksVolume = () => {
    return (
        <SectionTabNavs
            tabs={[
                {
                    value: SectionTabValues.CHART,
                    iconType: IconType.CHART_BARS,
                },
                {
                    value: SectionTabValues.TABLE,
                    iconType: IconType.TABLE,
                },
            ]}
            defaultValue={SectionTabValues.CHART}
        >
            <TasksVolumeProvider>
                <TabContent
                    forceMount
                    className={sharedStyles.tabContent}
                    value={SectionTabValues.CHART}
                >
                    <TasksVolumeChart />
                </TabContent>
                <TabContent
                    forceMount
                    className={sharedStyles.tabContent}
                    value={SectionTabValues.TABLE}
                >
                    <TasksVolumeTable />
                </TabContent>
            </TasksVolumeProvider>
        </SectionTabNavs>
    );
};
