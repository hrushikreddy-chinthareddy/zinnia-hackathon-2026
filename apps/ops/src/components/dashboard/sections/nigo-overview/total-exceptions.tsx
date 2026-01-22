import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { Point, Series } from 'highcharts';
import { FC } from 'react';

import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import { Statuses } from '@deps/models/case/case';
import { getExceptionCountQuery } from '@deps/queries/tanstack/dashboard/dashboardQueries';
import { useDashboardStore } from '@deps/store/store';
import { ExceptionCountGroupByEnum } from '@zinnia/api-types/types/analytics';

import styles from './nigo-overview.module.css';
import { ComparisonColumnChart } from '../../charts/bar-charts/comparison-column-chart';
import { defaultDateFormat, friendlyDateFormat } from '../../utils';

export const TotalExceptions: FC = () => {
    const { selectedCarriers, selectedBrokerDealers } = useDashboardStore(
        (state) => state
    );

    //One week ago values
    const oneWeekStartDate = dayjs()
        .subtract(7, 'day')
        .format(defaultDateFormat);
    const friendlyOneWeekStartDate =
        dayjs(oneWeekStartDate).format(friendlyDateFormat);
    const oneWeekEndDate = dayjs().format(defaultDateFormat);
    const friendlyOneWeekEndDate =
        dayjs(oneWeekEndDate).format(friendlyDateFormat);

    //Two week ago values
    const twoWeekStartDate = dayjs()
        .subtract(15, 'day')
        .format(defaultDateFormat);
    const friendlyTwoWeekStartDate =
        dayjs(twoWeekStartDate).format(friendlyDateFormat);
    const twoWeekEndDate = dayjs().subtract(8, 'day').format(defaultDateFormat);
    const friendlyTwoWeekEndDate =
        dayjs(twoWeekEndDate).format(friendlyDateFormat);

    const thisWeekFilter = {
        caseStatus: [
            Statuses.InProgress,
            Statuses.Exception,
            Statuses.NotStarted,
            Statuses.Inprogress,
        ],
        carrier: selectedCarriers,
        brokerDealerName: selectedBrokerDealers,
        exceptionCreatedDateStart: oneWeekStartDate,
        exceptionCreatedDateEnd: oneWeekEndDate,
    };

    const lastWeekFilter = {
        caseStatus: [
            Statuses.InProgress,
            Statuses.Exception,
            Statuses.NotStarted,
            Statuses.Inprogress,
        ],
        carrier: selectedCarriers,
        brokerDealerName: selectedBrokerDealers,
        exceptionCreatedDateStart: twoWeekStartDate,
        exceptionCreatedDateEnd: twoWeekEndDate,
    };

    const {
        data: thisWeekExceptions,
        isFetching: thisWeekFetching,
        isLoading: thisWeekLoading,
    } = useQuery({
        queryKey: ['thisWeekExceptions', thisWeekFilter],
        queryFn: async () => {
            const response = await getExceptionCountQuery(thisWeekFilter, [
                ExceptionCountGroupByEnum.CASE_STATUS,
            ]);
            return response.totalElements;
        },
        placeholderData: (previousData) => previousData,
        enabled: Object.keys(thisWeekFilter).length > 0,
    });

    const {
        data: lastWeekExceptions,
        isFetching: lastWeekFetching,
        isLoading: lastWeekLoading,
    } = useQuery({
        queryKey: ['lastWeekExceptions', lastWeekFilter],
        queryFn: async () => {
            const response = await getExceptionCountQuery(lastWeekFilter, [
                ExceptionCountGroupByEnum.CASE_STATUS,
            ]);
            return response.totalElements;
        },
        placeholderData: (previousData) => previousData,
        enabled: Object.keys(lastWeekFilter).length > 0,
    });

    const greaterThanLastWeek =
        (thisWeekExceptions || 0) > (lastWeekExceptions || 0);
    let percentDifferent;

    if (lastWeekExceptions === 0) {
        percentDifferent = thisWeekExceptions
            ? (thisWeekExceptions * 100).toFixed()
            : '0';
    } else {
        percentDifferent = (
            (((thisWeekExceptions || 0) - (lastWeekExceptions || 0)) /
                (lastWeekExceptions || 1)) *
            100
        ).toFixed();
    }
    const legendFormatter: Highcharts.FormatterCallbackFunction<
        Point | Series
    > = function (this) {
        const dateString = this.name;

        const dates = dateString.split(' - ');

        //reformat
        const startDate = dayjs(dates[0]).format('M/D');
        const endDate = dayjs(dates[1]).format('M/D');

        return `${startDate} - ${endDate}`;
    };

    return (
        <BlurOverlayLoader loading={thisWeekFetching || lastWeekFetching}>
            <div className={styles.container}>
                <div className={styles.titleContainer}>
                    <h2 className="typography-titles-subtitle">Total Issues</h2>
                    <div className={styles.countContainer}>
                        <p className={styles.title}>
                            {thisWeekExceptions?.toLocaleString()}
                        </p>
                        <p
                            className={clsx(
                                'typography-titles-subtitle',
                                styles.totalPercent
                            )}
                        >
                            {percentDifferent}%{' '}
                            {greaterThanLastWeek ? 'more' : 'less'} issues than
                            last week
                        </p>
                    </div>
                </div>
                {!thisWeekLoading && !lastWeekLoading && (
                    <ComparisonColumnChart
                        yAxisTitle="Issues"
                        colors={['#85bcd3', '#90b4cc']}
                        categories={[`Date range`]}
                        height={250}
                        legendFormatter={legendFormatter}
                        series={[
                            {
                                type: 'column',
                                name: `${friendlyTwoWeekStartDate} - ${friendlyTwoWeekEndDate}`,
                                data: [lastWeekExceptions || 0],
                            },
                            {
                                type: 'column',
                                name: `${friendlyOneWeekStartDate} - ${friendlyOneWeekEndDate}`,
                                data: [thisWeekExceptions || 0],
                            },
                        ]}
                    />
                )}
            </div>
        </BlurOverlayLoader>
    );
};
