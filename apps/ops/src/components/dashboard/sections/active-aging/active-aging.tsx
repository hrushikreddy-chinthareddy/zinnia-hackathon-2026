import { IconType, TabContent } from '@zinnia/bloom/components';

import { SectionTabNavs, SectionTabValues } from '../../sections-tab-nav/sections-tab-nav';
import { SubmissionTypeProvider } from '../submission-type/context/submission-type-context';
import { ActiveAgingChart } from './tab-content/chart/active-aging-chart';

export const ActiveAging = () => {
    return (
        <SectionTabNavs
            tabs={[
                {
                    value: SectionTabValues.CHART,
                    iconType: IconType.CHART_BARS,
                },
            ]}
        >
            <SubmissionTypeProvider>
                <TabContent forceMount className="data-[state=inactive]:hidden w-full" value={SectionTabValues.CHART}>
                    <ActiveAgingChart />
                </TabContent>
                {/* <TabContent forceMount className="data-[state=inactive]:hidden w-full" value={SectionTabValues.TABLE}>
                    <ActiveAgingChart />
                </TabContent>
                <TabContent forceMount className="data-[state=inactive]:hidden w-full" value={SectionTabValues.INSIGHTS}>
                    <ActiveAgingChart />
                </TabContent> */}
            </SubmissionTypeProvider>
        </SectionTabNavs>
    );
};
