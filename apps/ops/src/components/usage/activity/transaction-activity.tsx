import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { GroupedColumnsChart } from '@deps/components/dashboard/charts/bar-charts/grouped-column-chart/grouped-column-chart';
import {
    ErrorMessage,
    NoDataMessage,
} from '@deps/components/dashboard/components/errors';
import { TimeFilter } from '@deps/components/dashboard/filters/time-filter/time-filter';
import { useTimeRangeFilter } from '@deps/components/dashboard/filters/time-filter/useTimeRangeFilter';
import { defaultDateFormat } from '@deps/components/dashboard/utils';
import { FieldSize } from '@deps/components/fields/field';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import SelectComponent from '@deps/components/select/select';
import UsageHeaderLayout from '@deps/components/usage/usage-common-header';
import {
    ApiRoles,
    colors,
    generateCSVFileName,
    ROLE_OPTIONS,
} from '@deps/components/usage/utils';
import { getUserTransactionCountsQuery } from '@deps/queries/tanstack/usage/usageQueries';
import { startOfTomorrowLocalIso } from '@deps/utils/dates';
import { UserTransactionGroupByEnum } from '@zinnia/api-types/types/analytics';

import styles from './Activity.module.css';
import {
    TransactionActivityTooltip,
    transactionActivityTooltipFormatter,
} from './transaction-activity-tooltip';
import {
    TimeframeFilterOptions,
    aggregateByCategory,
    startDates,
    getTransactionTypesByCategory,
    PrepareTransactionActivityCSV,
    buildTopLevelSeries,
    buildDrilldownSeries,
} from './utils';
export const TransactionActivity = () => {
    const [role, setRole] = useState('All');
    const { t } = useTranslation();
    const {
        timeframeRadio,
        timerange,
        handleTimeframeRadioChange,
        handleRangeChange,
    } = useTimeRangeFilter<TimeframeFilterOptions>({
        startDates,
        defaultOption: TimeframeFilterOptions.Last1Month,
        dateFormat: defaultDateFormat,
    });
    const roleFilter =
        role === 'All'
            ? [
                  ApiRoles.Agent,
                  ApiRoles.ZinniaCallCenter,
                  ApiRoles.ZinniaOperations,
              ]
            : [role];

    const filter = {
        dateStart: timerange.from,
        dateEnd: startOfTomorrowLocalIso(timerange.to),
        userRole: roleFilter,
    };

    const {
        data: transactionData,
        isFetching: transactionDataFetching,
        isError: transactionDataError,
    } = useQuery({
        queryKey: ['selfServeTransactionActivity', filter],
        placeholderData: (previousData) => previousData,
        queryFn: () =>
            getUserTransactionCountsQuery(filter, [
                UserTransactionGroupByEnum.CARRIER,
                UserTransactionGroupByEnum.TRANSACTION_CATEGORY,
                UserTransactionGroupByEnum.TRANSACTION_TYPE,
            ]),
    });

    const categories = aggregateByCategory(transactionData?.data || [], colors);

    const topSeries = buildTopLevelSeries(categories);

    const dataByCategory: Record<
        string,
        { type: string; displayName: string; count: number }[]
    > = {};
    for (const cat of categories) {
        dataByCategory[cat.category] = getTransactionTypesByCategory(
            transactionData?.data || [],
            cat.category
        );
    }

    const ddSeries = buildDrilldownSeries(dataByCategory);

    const hasNoCategories = !categories || categories.length === 0;
    const hasNoSeries = !topSeries || topSeries.length === 0;

    const chartNotRenderable =
        transactionDataError || hasNoCategories || hasNoSeries;

    const xCats = categories.map((c) => c.displayName);
    const chartKey = `${timerange.from}__${timerange.to}__${role}`;

    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>
                <UsageHeaderLayout
                    title={String(
                        t('allFields.zinniaLiveTransactionActivityTitle') ?? ''
                    )}
                    description={String(
                        t(
                            'allFields.zinniaLiveTransactionActivityDescription'
                        ) ?? ''
                    )}
                    titleToolTip={<TransactionActivityTooltip />}
                    data={transactionData?.data || []}
                    csvFileName={generateCSVFileName({
                        title: `${role} ${
                            t('allFields.zinniaLiveTransactionActivityTitle') ??
                            ''
                        }`,
                        timerange,
                    })}
                    csvFunction={PrepareTransactionActivityCSV}
                />
                <div className="flex items-center justify-between gap-4 w-full">
                    <div className="mb-4 md:mb-0 md:w-1/5">
                        <SelectComponent
                            label="Role"
                            options={ROLE_OPTIONS}
                            size={FieldSize.XS}
                            name="role-type-dropdown-btn"
                            onChange={setRole}
                            value={role}
                        />
                    </div>
                    <TimeFilter
                        defaultValue={timeframeRadio}
                        onRadioChange={(val) =>
                            handleTimeframeRadioChange(
                                val as TimeframeFilterOptions
                            )
                        }
                        controlledTimeValue={timeframeRadio}
                        timerange={timerange}
                        handleTimerangeChange={handleRangeChange}
                        timeframeOptions={TimeframeFilterOptions}
                    />
                </div>
                <BlurOverlayLoader loading={transactionDataFetching}>
                    <div className="w-full flex-grow min-h-[400px]">
                        {chartNotRenderable ? (
                            transactionDataError ? (
                                <ErrorMessage />
                            ) : (
                                <NoDataMessage />
                            )
                        ) : (
                            <GroupedColumnsChart
                                key={chartKey}
                                categories={xCats}
                                series={topSeries}
                                xAxisTitle="All transactions"
                                yAxisTitle="Total transactions"
                                height={495}
                                pointWidth={60}
                                groupPadding={0.5}
                                tooltipFormatter={
                                    transactionActivityTooltipFormatter
                                }
                                enableDrilldown
                                drilldownSeries={ddSeries}
                            />
                        )}
                    </div>
                </BlurOverlayLoader>
            </div>
        </div>
    );
};
