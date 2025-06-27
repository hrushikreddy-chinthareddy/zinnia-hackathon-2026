import { useContext } from 'react';

import { AiInsightSummary } from '@deps/components/dashboard/ai-insight-summary/ai-insight-summary';
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import CardContainer from '@deps/containers/card-container/card-container';

import { IssueCountsByStatusContext } from '../../context/issue-counts-by-status-context';
import { IssueCountsByStatusHeader } from '../table/issue-counts-by-status-header';

export const IssueCountsByStatusAiInsights = () => {
    const { issueCountsByStatusData, timerange } = useContext(
        IssueCountsByStatusContext
    );
    const content = JSON.stringify(issueCountsByStatusData);
    const prompt = `You are an expert in all things case data. Your job is to summarize the data for business and executive users.
                          They want simple and insightful information about the data provided to you. The issues provided to you here are both resolved and unresolved which includes category, reason, deatailed reason and counts. Avoid using phrases such as "the data".
                          You are to use the following data to provide insights: ${JSON.stringify(
                              {
                                  ...issueCountsByStatusData,
                                  timerange,
                              }
                          )}.
                          Give insights on what the top 5 issues are based on the applied filters. Also, include the total issue count.
Your responses should be insightful and will be displayed on a UI as a summary. Your response should not include any suggestions. Use percentages and real data where it makes sense. Keep it concise and to the point. Format number values to U.S. standards. Any keys you use should be formatted to title case. For example, "FUTURE DATED REQUEST" should be shown as "Future Dated Request".`;
    return (
        <CardContainer
            fullWidth={false}
            classNames={sharedStyles.aiInsightsTabContainer}
        >
            <IssueCountsByStatusHeader />
            <div className={sharedStyles.insightContainer}>
                <AiInsightSummary
                    className="grow"
                    prompt={prompt}
                    content={content}
                />
            </div>
        </CardContainer>
    );
};
