import { useContext } from 'react';

import { AiInsightSummary } from '@deps/components/dashboard/ai-insight-summary/ai-insight-summary';
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { ChartHeader } from '@deps/components/dashboard/header-components/chart-header';
import CardContainer from '@deps/containers/card-container/card-container';

import { SubmissionTypeContext } from '../../context/submission-type-context';
import { SubmissionMethodTooltip } from '../../submission-type';

export const SubmissionTypeAIInsights = () => {
    const { graphStats, pieChartStats, timerange, submissionVs } = useContext(SubmissionTypeContext);

    const content = JSON.stringify({ ...graphStats, ...pieChartStats });
    const prompt = `You are an expert in all things case data. Your job is to summarize the data for business and executive users.
                          They want simple and insightful information about the data provided to you. The cases provided to you here are open cases delineated by insurance carrier. Avoid using phrases such as "the data".
                          You are to use the following data to provide insights: ${JSON.stringify({
                              ...graphStats,
                              timerange,
                              submissionVs,
                          })}.
                          Give insights on who the highest volume carriers, distribution partners or products
                          Your responses should be insightful and will be displayed on a UI as a summary for a module related to a pie chart. Use percentages and real data where it makes sense. Keep it conscise and to the point. Format number values to U.S. Any keys you use make sure they are formatted to title case. For example "ANNUITY APPLICATION" should be formatted to "Annuity Application".`;
    return (
        <CardContainer fullWidth={false} classNames={sharedStyles.aiInsightsTabContainer}>
            <ChartHeader title="Submission Method" subtitle={undefined} titleToolTip={SubmissionMethodTooltip} />
            <div className={sharedStyles.insightContainer}>
                <AiInsightSummary className="grow" prompt={prompt} content={content} />
            </div>
        </CardContainer>
    );
};
