import { AiInsightSummary } from '@deps/components/dashboard/ai-insight-summary/ai-insight-summary';
import CardContainer from '@deps/containers/card-container/card-container';
import { dashboardChartTitleFormat } from '@deps/helpers/dashboard/dashboard-helpers';
import { useContext } from 'react';
import { TransactionTrendsContext } from '../../context/transaction-trends-context';
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { TransactionTrendsHeader } from '../shared/transaction-trends-header';

export const TransactionTrendsAIInsights = () => {
    const { timeframe, groupBy, selectedProcess, transactionTrendsData } = useContext(TransactionTrendsContext);

    const content = JSON.stringify(transactionTrendsData?.data);

    const prompt = [
        `You are an expert in all things ${selectedProcess} case data.`,
        `Your job is to summarize the data for business and executive users.`,
        `They want simple and insightful information about the data provided to you.`,
        `The data provided to you here are completed ${dashboardChartTitleFormat(
            selectedProcess ?? 'Any type of',
            false
        )} cases in the last ${timeframe}`,
        `The data is grouped by ${groupBy}.`,
        `Avoid using phrases such as "the data".`,
        `Your responses should be insightful and will be displayed on a UI as a summary for a module related to a timeseries chart.`,
        `Use percentages and real data where it makes sense.`,
        `Keep it concise and to the point`,
        `Format number values to U.S. including commas where appropriate.`,
        `Any keys you use make sure they are formatted to title case. For example "ANNUITY APPLICATION" should be formatted to "Annuity Application".`,
    ].join(' ');

    return (
        <CardContainer fullWidth={false} classNames={sharedStyles.aiInsightsTabContainer}>
            <TransactionTrendsHeader />
            <div className={sharedStyles.insightContainer}>
                <AiInsightSummary className="grow" prompt={prompt} content={content} />
            </div>
        </CardContainer>
    );
};
