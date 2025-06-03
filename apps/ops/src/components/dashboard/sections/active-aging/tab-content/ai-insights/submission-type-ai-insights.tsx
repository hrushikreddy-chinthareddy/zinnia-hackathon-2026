import { useContext } from 'react';

import { AiInsightSummary } from '@deps/components/dashboard/ai-insight-summary/ai-insight-summary';
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import CardContainer from '@deps/containers/card-container/card-container';

import { ActiveAgingContext } from '../../context/active-aging-context';
import { ActiveAgingHeader } from '../shared/active-aging-header';

export const ActiveAgingAiInsights = () => {
    const { timeframe, timeRangeData } = useContext(ActiveAgingContext);

    const content = JSON.stringify({ timeframe });
    const prompt = `You are an expert in all things case data. Your job is to summarize the data for business and executive users. The cases provided to you here are open cases delineated by insurance carrier. Avoid using phrases such as "the data".
                          You are to use the following data to provide insights: ${JSON.stringify({
                              ...timeRangeData,
                              timeframe,
                          })}.
                          Give insights on what processes have been open for the longest time, and what those timeframes are.
                          Use percentages and real data where it makes sense. Keep it conscise and to the point. Format number values to U.S. Any keys you use make sure they are formatted to title case. For example "ANNUITY APPLICATION" should be formatted to "Annuity Application".`;
    return (
        <CardContainer fullWidth={false} classNames={sharedStyles.aiInsightsTabContainer}>
            <ActiveAgingHeader />
            <div className={sharedStyles.insightContainer}>
                <AiInsightSummary className="grow" prompt={prompt} content={content} />
            </div>
        </CardContainer>
    );
};
