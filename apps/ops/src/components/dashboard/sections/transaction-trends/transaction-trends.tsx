import clsx from 'clsx';
import { useContext } from 'react';

import { AiInsightSummary } from '@deps/components/dashboard/ai-insight-summary/ai-insight-summary';
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import CardContainer from '@deps/containers/card-container/card-container';
import { dashboardChartTitleFormat, splitAndSentenceCase } from '@deps/helpers/dashboard/dashboard-helpers';
import { convertToQueryString } from '@deps/helpers/routing.helper';
import { GroupByOptions } from '@deps/models/case/enums';

import { TransactionTrendsContext } from './context/transaction-trends-context';
import { TransactionTrendsFilters } from './tab-content/shared/transaction-trends-filters';
import { TransactionTrendsHeader } from './tab-content/shared/transaction-trends-header';
import styles from './transaction-trends.module.css';
import { TransactionTrendsTable } from './trends-table';
import { LineAndVolumeCategoryChart } from '../../charts/line-and-volume-category-chart/line-and-volume-category-chart';

const colors = ['#D385A5', '#BD85D3', '#8593D3', '#00628B', '#021936'];

export const TransactionTrends = () => {
    const { timeframe, filter, groupBy, selectedProcess, transactionTrendsData, transactionTrendsDataFetching, chartData } =
        useContext(TransactionTrendsContext);

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

    const carrierOrProduct =
        groupBy === GroupByOptions.ProcessSubType
            ? 'requestSubType'
            : groupBy === GroupByOptions.Carrier
            ? 'carrier'
            : groupBy === GroupByOptions.ProductName
            ? 'productName'
            : 'brokerDealerName';

    return (
        <CardContainer fullWidth={true}>
            <TransactionTrendsHeader />
            <div className="flex">
                <div className={clsx('w-1/4', sharedStyles.aiInsightsContainer)}>
                    <AiInsightSummary className="grow" prompt={prompt} content={content} />
                </div>

                <div className={clsx('w-3/4', sharedStyles.chartContainer)}>
                    <TransactionTrendsFilters />

                    <BlurOverlayLoader loading={transactionTrendsDataFetching || !chartData}>
                        <TransactionTrendsTable
                            timeframe={timeframe}
                            data={chartData}
                            legendLabel={splitAndSentenceCase(groupBy)}
                            colors={colors}
                            linkQueryFormat={`/cases${convertToQueryString({
                                ...filter,
                                [carrierOrProduct]: 'replaceme',
                            } as any)}`}
                        />
                        <div className={styles.chartContainer}>
                            <LineAndVolumeCategoryChart timeframe={timeframe} chartData={chartData} />
                        </div>
                    </BlurOverlayLoader>
                </div>
            </div>
        </CardContainer>
    );
};
