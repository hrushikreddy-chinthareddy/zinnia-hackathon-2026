import { IconType, TabContent } from '@zinnia/bloom/components';
import { FC } from 'react';

import { IssueCountsByStatusProvider } from './context/issue-counts-by-status-context';
import {
    SectionTabNavs,
    SectionTabValues,
} from '../../sections-tab-nav/sections-tab-nav';
import { IssueCountsByStatusAiInsights } from './tab-content/ai-insights/issue-counts-by-status-ai-insights';
import { IssueCountsByStatusTable } from './tab-content/table/issue-counts-by-status-table';

export const IssueCountsByStatus: FC = () => {
    return (
        <>
            <SectionTabNavs
                tabs={[
                    {
                        value: SectionTabValues.TABLE,
                        iconType: IconType.TABLE,
                    },
                    {
                        value: SectionTabValues.INSIGHTS,
                        iconType: IconType.SPARKLES,
                    },
                ]}
                defaultValue={SectionTabValues.TABLE}
            >
                <IssueCountsByStatusProvider>
                    <TabContent
                        forceMount
                        className="data-[state=inactive]:hidden w-full"
                        value={SectionTabValues.TABLE}
                    >
                        <IssueCountsByStatusTable />
                    </TabContent>
                    <TabContent
                        forceMount
                        className="data-[state=inactive]:hidden w-full"
                        value={SectionTabValues.INSIGHTS}
                    >
                        <IssueCountsByStatusAiInsights />
                    </TabContent>
                </IssueCountsByStatusProvider>
            </SectionTabNavs>
        </>
    );
};
