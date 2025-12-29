import { IconType, TabContent } from '@zinnia/bloom/components';

import { TasksVolumeProvider } from './context/tasks-volume-context';
import {
    SectionTabNavs,
    SectionTabValues,
} from '../../sections-tab-nav/sections-tab-nav';
import { TasksVolumeTable } from './tab-content/table/tasks-volume-table';

export const TasksVolume = () => {
    return (
        <SectionTabNavs
            tabs={[
                {
                    value: SectionTabValues.TABLE,
                    iconType: IconType.TABLE,
                },
            ]}
            defaultValue={SectionTabValues.TABLE}
        >
            <TasksVolumeProvider>
                <TabContent
                    forceMount
                    className="data-[state=inactive]:hidden w-full"
                    value={SectionTabValues.TABLE}
                >
                    <TasksVolumeTable />
                </TabContent>
            </TasksVolumeProvider>
        </SectionTabNavs>
    );
};
