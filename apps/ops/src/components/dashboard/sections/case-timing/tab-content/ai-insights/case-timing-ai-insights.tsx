import { FC, useContext, useMemo } from 'react';

import { AiInsightSummary } from '@deps/components/dashboard/ai-insight-summary/ai-insight-summary';
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import CardContainer from '@deps/containers/card-container/card-container';
import { dashboardChartTitleFormat } from '@deps/helpers/dashboard/dashboard-helpers';
import { GroupByOptions } from '@deps/models/case/enums';

import { CaseTimingContext } from '../../context/case-timing-context';
import { CaseTimingHeader } from '../shared/case-timing-header';

export const CaseTimingAiInsights: FC = () => {
    const { timeframe, caseTimingData, selectedProcess } = useContext(CaseTimingContext);

    const content = JSON.stringify({ timeframe });
    const prompt = useMemo(
        () =>
            [
                `You are an expert in all things ${selectedProcess} case data.`,
                `Your job is to summarize the data for business and executive users.`,
                `They want simple and insightful information about the data provided to you.`,
                `The data provided to you here are completed ${dashboardChartTitleFormat(selectedProcess || '', false)} cases.`,
                `The data is grouped by ${GroupByOptions.ProcessSubType}.`,
                `The timespan the data comes from is ${timeframe}.`,
                `You are to take the median time in seconds and convert it to days, hours, minutes or seconds depending on the timespan.`,
                `Avoid using phrases such as "the data".`,
                `Your responses should be insightful and will be displayed on a UI as a summary for a module related to a timeseries chart.`,
                `Use percentages and real data where it makes sense.`,
                `Keep it concise and to the point, but please summarize all the data points.`,
                `Format number values to U.S. including commas where appropriate.`,
                `Any keys you use make sure they are formatted to title case. For example "ANNUITY APPLICATION" should be formatted to "Annuity Application".`,
                `You can use the following data to analyze: `,
                `${JSON.stringify(caseTimingData)}`,
            ].join(' '),
        [caseTimingData, selectedProcess, timeframe]
    );
    return (
        <CardContainer fullWidth={false} classNames={sharedStyles.aiInsightsTabContainer}>
            <CaseTimingHeader />
            <div className={sharedStyles.insightContainer}>
                <AiInsightSummary className="grow" prompt={prompt} content={content} />
            </div>
        </CardContainer>
    );
};
