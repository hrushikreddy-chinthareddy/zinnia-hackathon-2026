import { TabContent } from '@zinnia/bloom/components';

import { TransactionTrendsProvider } from './context/transaction-trends-context';
import { TransactionTrendsChart } from './tab-content/chart/transaction-trends-chart';
import {
    SectionTabNavs,
    SectionTabValues,
} from '../../sections-tab-nav/sections-tab-nav';
import { TransactionTrendsAIInsights } from './tab-content/ai-insights/transaction-trends-ai-insights';
import { TransactionTrendsTable } from './tab-content/table/transaction-trends-table';

export const TransactionTrends = () => {
    return (
        <SectionTabNavs>
            <TransactionTrendsProvider>
                <TabContent
                    forceMount
                    className="data-[state=inactive]:hidden w-full"
                    value={SectionTabValues.CHART}
                >
                    <TransactionTrendsChart />
                </TabContent>
                <TabContent
                    forceMount
                    className="data-[state=inactive]:hidden w-full"
                    value={SectionTabValues.TABLE}
                >
                    <TransactionTrendsTable />
                </TabContent>
                <TabContent
                    forceMount
                    className="data-[state=inactive]:hidden w-full"
                    value={SectionTabValues.INSIGHTS}
                >
                    <TransactionTrendsAIInsights />
                </TabContent>
            </TransactionTrendsProvider>
        </SectionTabNavs>
    );
};
