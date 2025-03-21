import { TabContent } from '@zinnia/bloom/components';

import { SectionTabNavs, SectionTabValues } from '@deps/components/dashboard/sections-tab-nav/sections-tab-nav';

import { CaseTimingProvider } from './context/case-timing-context';
import { CaseTimingAiInsights } from './tab-content/ai-insights/case-timing-ai-insights';
import { CaseTimingChart } from './tab-content/chart/case-timing-chart';
import { CaseTimingTable } from './tab-content/table/case-timing-table';

export const CaseTiming = () => {
    return (
        <SectionTabNavs>
            <CaseTimingProvider>
                <TabContent forceMount className="data-[state=inactive]:hidden w-full" value={SectionTabValues.CHART}>
                    <CaseTimingChart />
                </TabContent>
                <TabContent forceMount className="data-[state=inactive]:hidden w-full" value={SectionTabValues.TABLE}>
                    <CaseTimingTable />
                </TabContent>
                <TabContent forceMount className="data-[state=inactive]:hidden w-full" value={SectionTabValues.INSIGHTS}>
                    <CaseTimingAiInsights />
                </TabContent>
            </CaseTimingProvider>
        </SectionTabNavs>
    );
};
