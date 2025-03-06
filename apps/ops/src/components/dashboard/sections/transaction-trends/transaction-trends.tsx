import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

import { AiInsightSummary } from '@deps/components/dashboard/ai-insight-summary/ai-insight-summary';
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { CaseTypeFilter, ExtendedProcesses } from '@deps/components/dashboard/filters/case-type-filter';
import { TimeFilter } from '@deps/components/dashboard/filters/time-filter/time-filter';
import { ChartHeader } from '@deps/components/dashboard/header-components/chart-header';
import { createBaseQuery, formatProcessFilter } from '@deps/components/dashboard/utils';
import { FieldSize } from '@deps/components/fields/field';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import Select from '@deps/components/select/select';
import CardContainer from '@deps/containers/card-container/card-container';
import { TimeframeFilterOptions } from '@deps/containers/dashboard/closed-transactions/closed-transactions';
import { dashboardChartTitleFormat, splitAndSentenceCase } from '@deps/helpers/dashboard/dashboard-helpers';
import { processGroupedData } from '@deps/helpers/dashboard/line-and-volume-category-chart.helper';
import { convertToQueryString } from '@deps/helpers/routing.helper';
import { Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { DashboardSearchFilter } from '@deps/queries/cases';
import { useDashboardStore } from '@deps/store/store';

import styles from './transaction-trends.module.css';
import { TransactionTrendsTable } from './trends-table';
import { LineAndVolumeCategoryChart } from '../../charts/line-and-volume-category-chart/line-and-volume-category-chart';

const colors = ['#D385A5', '#BD85D3', '#8593D3', '#00628B', '#021936'];

const defaultDateFormat = 'YYYY-MM-DD';

export const TransactionTrends = () => {
    const [timeframe, setTimeframe] = useState<TimeframeFilterOptions>(TimeframeFilterOptions.Trailing12Months);
    const [selectedProcess, setSelectedProcess] = useState<Processes | ExtendedProcesses>(Processes.NewBusiness);

    const { selectedBrokerDealers, selectedCarriers } = useDashboardStore(state => state);
    const [groupBy, setGroupBy] = useState<GroupByOptions>(
        Object.keys(selectedCarriers).length ? GroupByOptions.ProcessSubType : GroupByOptions.Carrier
    );

    const startDates = useMemo(
        () => ({
            [TimeframeFilterOptions.Trailing12Months]: dayjs().subtract(12, 'month').format(defaultDateFormat),
            [TimeframeFilterOptions.Last6Months]: dayjs().subtract(6, 'month').format(defaultDateFormat),
            [TimeframeFilterOptions.Last90Days]: dayjs().subtract(3, 'month').format(defaultDateFormat),
            [TimeframeFilterOptions.Last60Days]: dayjs().subtract(2, 'month').format(defaultDateFormat),
            [TimeframeFilterOptions.LastMonth]: dayjs().subtract(1, 'month').format(defaultDateFormat),
        }),
        []
    );

    const filter: DashboardSearchFilter = {
        createdDateStart: startDates[timeframe],
        process: formatProcessFilter(selectedProcess),
        caseStatus: [Statuses.Completed],
        carrier: Object.keys(selectedCarriers),
        brokerDealerName: Object.keys(selectedBrokerDealers),
    };

    const { data: transactionTrendsData, isFetching: transactionTrendsDataFetching } = useQuery({
        queryKey: ['transactionTrends', filter, groupBy],
        placeholderData: previousData => previousData,
        queryFn: () => createBaseQuery(filter, [groupBy, GroupByOptions.UpdatedAt]),
        enabled: Object.keys(filter).length > 0,
    });

    // If there is a selected carrier, default to the product name. Otherwise back to carrier
    useEffect(() => {
        if (selectedCarriers && Object.keys(selectedCarriers).length) {
            setGroupBy(GroupByOptions.ProcessSubType);
        } else {
            setGroupBy(GroupByOptions.Carrier);
        }
    }, [selectedCarriers]);

    const carrierOrBrokerDealer = useMemo(() => {
        if (selectedCarriers) {
            return GroupByOptions.Carrier;
        }

        if (selectedBrokerDealers) {
            return GroupByOptions.BrokerDealerName;
        }
        return GroupByOptions.Carrier;
    }, [selectedBrokerDealers, selectedCarriers]);

    const groupByOptions = [
        { label: 'Sub process', value: GroupByOptions.ProcessSubType },
        { label: 'Carrier', value: GroupByOptions.Carrier, disabled: filter.carrier?.length === 1 },
        { label: 'Product', value: GroupByOptions.ProductName },
        { label: 'Distribution Partner', value: GroupByOptions.BrokerDealerName },
    ];

    const totalCaseCount = transactionTrendsData?.data?.map(stat => stat.count).reduce((a, b) => a + b, 0);

    const totalCases = transactionTrendsDataFetching ? (
        <div className="blur">
            <p className={'typography-titles-subtitle'}>{totalCaseCount?.toLocaleString() || '0'} total cases</p>
        </div>
    ) : (
        <p className={'typography-titles-subtitle'}>{totalCaseCount?.toLocaleString() || '0'} total cases</p>
    );

    const content = JSON.stringify(transactionTrendsData?.data);

    const prompt = [
        `You are an expert in all things ${selectedProcess} case data.`,
        `Your job is to summarize the data for business and executive users.`,
        `They want simple and insightful information about the data provided to you.`,
        `The data provided to you here are completed ${dashboardChartTitleFormat(
            selectedProcess ?? 'Any type of',
            false
        )} cases in the last ${timeframe}`,
        `The data is grouped by ${groupByOptions.join(', ')}.`,
        `Avoid using phrases such as "the data".`,
        `Your responses should be insightful and will be displayed on a UI as a summary for a module related to a timeseries chart.`,
        `Use percentages and real data where it makes sense.`,
        `Keep it concise and to the point`,
        `Format number values to U.S. including commas where appropriate.`,
        `Any keys you use make sure they are formatted to title case. For example "ANNUITY APPLICATION" should be formatted to "Annuity Application".`,
    ].join(' ');

    //TODO: This function is sooooooo sloooowww
    const processedData = useMemo(
        () => processGroupedData(transactionTrendsData?.data ?? [], timeframe),
        [transactionTrendsData?.data, timeframe]
    );

    return (
        <CardContainer fullWidth={true}>
            <ChartHeader title="Transaction trends" subtitle={totalCases} description={`Top 5 ${splitAndSentenceCase(groupBy)}s`} />
            <div className="flex">
                <div className={clsx('w-1/4', sharedStyles.aiInsightsContainer)}>
                    <AiInsightSummary className="grow" prompt={prompt} content={content} />
                </div>

                <div className={clsx('w-3/4', sharedStyles.chartContainer)}>
                    <div className={sharedStyles.filterContainer}>
                        <div className="w-1/2 flex gap-4">
                            <Select
                                maxContentWidth
                                label="Group by"
                                className={sharedStyles.selectDropdowns}
                                options={groupByOptions}
                                value={groupBy}
                                size={FieldSize.XS}
                                onChange={val => setGroupBy(val as GroupByOptions)}
                            />
                            <CaseTypeFilter
                                onValueChange={setSelectedProcess}
                                defaultProcess={Processes.NewBusiness}
                                caseStatus={[Statuses.Completed]}
                            />
                        </div>
                        <div className="w-1/2">
                            <TimeFilter
                                defaultValue={timeframe}
                                onValueChange={val => setTimeframe(val as TimeframeFilterOptions)}
                                timeframeOptions={TimeframeFilterOptions}
                            />
                        </div>
                    </div>

                    <BlurOverlayLoader loading={transactionTrendsDataFetching}>
                        <TransactionTrendsTable
                            timeframe={timeframe}
                            data={processedData}
                            legendLabel={splitAndSentenceCase(groupBy)}
                            colors={colors}
                            linkQueryFormat={`/cases${convertToQueryString({
                                ...filter,
                                [carrierOrBrokerDealer]: 'replaceme',
                            } as any)}`}
                        />
                        <div className={styles.chartContainer}>
                            <LineAndVolumeCategoryChart timeframe={timeframe} chartData={processedData} />
                        </div>
                    </BlurOverlayLoader>
                </div>
            </div>
        </CardContainer>
    );
};
