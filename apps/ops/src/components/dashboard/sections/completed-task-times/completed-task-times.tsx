import { IconType, TabContent } from '@zinnia/bloom/components';

import { CompletedTaskTimeProvider } from './context/completed-task-times-context';
import {
    SectionTabNavs,
    SectionTabValues,
} from '../../sections-tab-nav/sections-tab-nav';
import { CompletedTaskTimesTable } from './tab-content/table/completed-task-times-table';

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
