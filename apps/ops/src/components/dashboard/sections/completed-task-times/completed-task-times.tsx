import { IconType, TabContent } from '@zinnia/bloom/components';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { CompletedTaskTimesTable } from '@deps/components/dashboard/sections/completed-task-times//tab-content/table/completed-task-times-table';
import { CompletedTaskTimeProvider } from '@deps/components/dashboard/sections/completed-task-times/context/completed-task-times-provider';
import { CompletedTaskTimesChart } from '@deps/components/dashboard/sections/completed-task-times/tab-content/chart/completed-task-times-chart';
import {
    SectionTabNavs,
    SectionTabValues,
} from '@deps/components/dashboard/sections-tab-nav/sections-tab-nav';

export const CompletedTaskTime = () => {
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
            <CompletedTaskTimeProvider>
                <TabContent
                    className={sharedStyles.tabContent}
                    value={SectionTabValues.CHART}
                >
                    <CompletedTaskTimesChart />
                </TabContent>
                <TabContent
                    className={sharedStyles.tabContent}
                    value={SectionTabValues.TABLE}
                >
                    <CompletedTaskTimesTable />
                </TabContent>
            </CompletedTaskTimeProvider>
        </SectionTabNavs>
    );
};
