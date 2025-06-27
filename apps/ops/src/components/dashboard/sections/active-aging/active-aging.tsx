import { TabContent } from '@zinnia/bloom/components';

import { ActiveAgingProvider } from './context/active-aging-context';
import {
    SectionTabNavs,
    SectionTabValues,
} from '../../sections-tab-nav/sections-tab-nav';
import { ActiveAgingAiInsights } from './tab-content/ai-insights/submission-type-ai-insights';
import { ActiveAgingChart } from './tab-content/chart/active-aging-chart';
import { ActiveAgingTable } from './tab-content/table/active-aging-table';

export const ActiveAging = () => {
    return (
        <SectionTabNavs>
            <ActiveAgingProvider>
                <TabContent
                    forceMount
                    className="data-[state=inactive]:hidden w-full"
                    value={SectionTabValues.CHART}
                >
                    <ActiveAgingChart />
                </TabContent>
                <TabContent
                    forceMount
                    className="data-[state=inactive]:hidden w-full"
                    value={SectionTabValues.TABLE}
                >
                    <ActiveAgingTable />
                </TabContent>
                <TabContent
                    forceMount
                    className="data-[state=inactive]:hidden w-full"
                    value={SectionTabValues.INSIGHTS}
                >
                    <ActiveAgingAiInsights />
                </TabContent>
            </ActiveAgingProvider>
        </SectionTabNavs>
    );
};
