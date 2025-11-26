import { IconType, TabContent } from '@zinnia/bloom/components';

import { CompletedTaskTimesTable } from '@deps/components/dashboard/sections/completed-task-times//tab-content/table/completed-task-times-table';
import { CompletedTaskTimeProvider } from '@deps/components/dashboard/sections/completed-task-times/context/completed-task-times-provider';
import {
    SectionTabNavs,
    SectionTabValues,
} from '@deps/components/dashboard/sections-tab-nav/sections-tab-nav';

export const CompletedTaskTime = () => {
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
            <CompletedTaskTimeProvider>
                <TabContent
                    forceMount
                    className="data-[state=inactive]:hidden w-full"
                    value={SectionTabValues.TABLE}
                >
                    <CompletedTaskTimesTable />
                </TabContent>
            </CompletedTaskTimeProvider>
        </SectionTabNavs>
    );
};
