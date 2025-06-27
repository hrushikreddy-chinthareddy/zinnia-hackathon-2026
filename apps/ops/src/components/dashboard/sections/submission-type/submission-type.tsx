import { TabContent } from '@zinnia/bloom/components';

import { SubmissionTypeProvider } from '@deps/components/dashboard/sections/submission-type/context/submission-type-context';
import { SubmissionTypeChart } from '@deps/components/dashboard/sections/submission-type/tab-content/chart/submission-type-chart';
import {
    SectionTabNavs,
    SectionTabValues,
} from '@deps/components/dashboard/sections-tab-nav/sections-tab-nav';

import { SubmissionTypeAIInsights } from './tab-content/ai-insights/submission-type-ai-insights';
import { SubmissionTypeTable } from './tab-content/table/submission-type-table';

export const SubmissionMethodTooltip = (
    <>
        <p>
            <span className="font-bold">Electronic (E-App):</span> Submitted
            electronically via integrated third-party systems.
        </p>

        <p>
            <span className="font-bold">Paper:</span> Submitted in physical
            format and processed manually.
        </p>
    </>
);

export const SubmissionType = () => {
    return (
        <SectionTabNavs>
            <SubmissionTypeProvider>
                <TabContent
                    forceMount
                    className="data-[state=inactive]:hidden w-full"
                    value={SectionTabValues.CHART}
                >
                    <SubmissionTypeChart />
                </TabContent>
                <TabContent
                    forceMount
                    className="data-[state=inactive]:hidden w-full"
                    value={SectionTabValues.TABLE}
                >
                    <SubmissionTypeTable />
                </TabContent>
                <TabContent
                    forceMount
                    className="data-[state=inactive]:hidden w-full"
                    value={SectionTabValues.INSIGHTS}
                >
                    <SubmissionTypeAIInsights />
                </TabContent>
            </SubmissionTypeProvider>
        </SectionTabNavs>
    );
};
