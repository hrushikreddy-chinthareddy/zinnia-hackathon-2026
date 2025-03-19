import { TabContent } from '@zinnia/bloom/components';

import { SectionTabNavs, SectionTabValues } from '@deps/components/dashboard/sections-tab-nav/sections-tab-nav';

import { CaseTimingProvider } from './context/case-timing-context';
import { CaseTimingChart } from './tab-content/chart/case-timing-chart';

export const CaseTiming = () => {
    return (
        <SectionTabNavs>
            <CaseTimingProvider>
                <TabContent forceMount className="data-[state=inactive]:hidden w-full" value={SectionTabValues.CHART}>
                    <CaseTimingChart />
                </TabContent>
                <TabContent forceMount className="data-[state=inactive]:hidden w-full" value={SectionTabValues.TABLE}>
                    <CaseTimingChart />
                </TabContent>
                <TabContent forceMount className="data-[state=inactive]:hidden w-full" value={SectionTabValues.INSIGHTS}>
                    <CaseTimingChart />
                </TabContent>
            </CaseTimingProvider>
        </SectionTabNavs>
    );
};
