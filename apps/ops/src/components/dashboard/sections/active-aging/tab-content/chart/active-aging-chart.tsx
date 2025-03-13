import { generateNewColor } from '@zinnia/utils';
import clsx from 'clsx';
import { SeriesOptionsType } from 'highcharts';
import { useContext, useMemo } from 'react';

import { StackedColumnChart } from '@deps/components/dashboard/charts/bar-charts/stacked-column-chart';
import { PieChart } from '@deps/components/dashboard/charts/pie-charts/pie-chart';
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { CaseTypeFilter } from '@deps/components/dashboard/filters/case-type-filter';
import { TimeFilter } from '@deps/components/dashboard/filters/time-filter/time-filter';
import { ChartHeader } from '@deps/components/dashboard/header-components/chart-header';
import { Legend } from '@deps/components/dashboard/legend/legend';
import { FieldSize } from '@deps/components/fields/field';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import Select from '@deps/components/select/select';
import CardContainer from '@deps/containers/card-container/card-container';
import { Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';

import { ActiveAgingContext } from '../../context/active-aging-context';
import { ActiveAgingTimeRange, generateActiveAgingCategories, getFormattedDateRange } from '../../utils';

export const colors = [
    '#00628B',
    '#021936',
    '#8593D3',
    '#C18DD6',
    '#D385A5',
    '#BF91BA',
    '#F6AF3B',
    '#FF65A1',
    '#3B82F6',
    '#FF984C',
    '#FF6F82',
];

export const ActiveAgingChart = () => {
    const {
        groupBy,
        setGroupBy,
        filter,
        selectedProcess,
        setSelectedProcess,
        timeframe,
        setTimeframe,
        activeAgingDataFetching,
        chartSeries,
        pieSeries,
        totalCaseCount,
        caseStatus,
        setCaseStatus,
    } = useContext(ActiveAgingContext);

    const groupByOptions = [
        { label: 'Carrier', value: GroupByOptions.Carrier, disabled: filter.carrier?.length === 1 },
        { label: 'Subprocess', value: GroupByOptions.ProcessSubType },
        { label: 'Distribution Partner', value: GroupByOptions.BrokerDealerName },
    ];

    const legendItemsNew = useMemo(() => {
        return (
            chartSeries?.map((item, index) => {
                const color = colors[index] ?? generateNewColor(colors);
                if (!colors.includes(color)) {
                    colors.push(color);
                }
                return {
                    label: item.name,
                    color,
                };
            }) || []
        );
    }, [chartSeries]);

    const totalCases = activeAgingDataFetching ? (
        <div className="blur">
            <p className={'typography-titles-subtitle'}>{totalCaseCount?.toLocaleString() || '0'} total cases</p>
        </div>
    ) : (
        <p className={'typography-titles-subtitle'}>{totalCaseCount?.toLocaleString() || '0'} total cases</p>
    );

    const controlledTimeRangeText = getFormattedDateRange(timeframe);

    const caseStatusOptions = [
        { label: 'In Progress', displayText: 'In Progress', value: Statuses.InProgress },
        { label: 'Exception', displayText: 'Exception', value: Statuses.Exception },
        { label: 'Not Started', displayText: 'Not Started', value: Statuses.NotStarted },
    ];

    const handleCaseStatusChange = (status: Statuses) => {
        const newStatus = { ...caseStatus };

        if (newStatus[status]) {
            //dont delete if its the only one selected
            if (Object.keys(newStatus).length === 1) {
                return;
            }
            delete newStatus[status];
        } else {
            newStatus[status] = status;
        }
        setCaseStatus(newStatus);
    };

    return (
        <div className="flex gap-4">
            <div className="w-3/4">
                <CardContainer fullWidth={false}>
                    <ChartHeader
                        title="Active Aging"
                        subtitle={totalCases}
                        description="The duration of active cases, helping track case age and identify delays in processing."
                    />
                    <div className={sharedStyles.filterContainer}>
                        <div className="w-1/2 flex gap-2">
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
                                caseStatus={Object.keys(caseStatus) as Statuses[]}
                                defaultProcess={Processes.NewBusiness}
                                value={selectedProcess}
                            />
                            <Select
                                maxContentWidth
                                label="Case status"
                                className={sharedStyles.selectDropdowns}
                                options={caseStatusOptions}
                                value={caseStatus}
                                size={FieldSize.XS}
                                isMultiselect
                                onChange={val => handleCaseStatusChange(val as Statuses)}
                            />
                        </div>
                        <div className="w-1/2">
                            <TimeFilter
                                defaultValue={timeframe}
                                timeframeOptions={ActiveAgingTimeRange}
                                onValueChange={val => setTimeframe(val as ActiveAgingTimeRange)}
                                controlledTimeValue={timeframe}
                                controlledRangeText={controlledTimeRangeText}
                            />
                        </div>
                    </div>

                    <BlurOverlayLoader loading={activeAgingDataFetching}>
                        <StackedColumnChart
                            series={chartSeries as SeriesOptionsType[]}
                            categories={generateActiveAgingCategories(timeframe)}
                            colors={colors}
                            yAxisTitle="Case Volume"
                        />
                        <Legend items={legendItemsNew} title="Duration of open cases" />
                    </BlurOverlayLoader>
                </CardContainer>
            </div>
            <div className={clsx('w-1/4 pt-40', sharedStyles.pieChartColumn)}>
                <PieChart colors={colors} series={pieSeries as SeriesOptionsType[]} />
            </div>
        </div>
    );
};
