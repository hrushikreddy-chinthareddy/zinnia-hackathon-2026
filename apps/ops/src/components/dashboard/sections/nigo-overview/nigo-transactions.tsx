import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { FC } from 'react';

import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import { oneYearAgoISO } from '@deps/helpers/dashboard/dashboard-helpers';
import { Statuses } from '@deps/models/case/case';
import { useDashboardStore } from '@deps/store/store';
import { CaseCountGroupByEnum } from '@zinnia/api-types/types/analytics';

import styles from './nigo-overview.module.css';
import { PieChart } from '../../charts/pie-charts/pie-chart';
import { createBaseQuery } from '../../utils';

export const NIGOTransactions: FC = () => {
    const { selectedCarriers, selectedBrokerDealers } = useDashboardStore(
        (state) => state
    );

    const filter = {
        caseStatus: [
            Statuses.InProgress,
            Statuses.Exception,
            Statuses.NotStarted,
            Statuses.Inprogress,
        ],
        carrier: Object.keys(selectedCarriers),
        brokerDealerName: Object.keys(selectedBrokerDealers),
        createdDateStart: oneYearAgoISO,
    };

    const {
        data: caseCount,
        isFetching: totalCaseCountFetching,
        isLoading: totalCaseCountLoading,
    } = useQuery({
        queryKey: ['totalOpenCaseCount', filter],
        queryFn: async () => {
            const response = await createBaseQuery(filter, [
                CaseCountGroupByEnum.CASE_STATUS,
            ]);
            return {
                nigoCount: response.data.filter(
                    (item) => item.name === Statuses.Exception
                )[0].count,
                totalOpenCaseCount: response.totalElements,
            };
        },
        placeholderData: (previousData) => previousData,
        enabled: Object.keys(filter).length > 0,
    });

    const percentNigoOfTotal =
        ((caseCount?.nigoCount || 1) / (caseCount?.totalOpenCaseCount || 1)) *
        100;
    const pieSeries = [
        {
            name: 'open cases',
            colorByPoint: true,
            type: 'pie',
            data: [
                {
                    name: 'Not in good order',
                    y: Math.round(percentNigoOfTotal),
                },
                {
                    name: 'In good order',
                    y: 100 - Math.round(percentNigoOfTotal),
                },
            ],
        },
    ];

    return (
        <BlurOverlayLoader loading={totalCaseCountFetching}>
            <div className={styles.container}>
                <div className={styles.titleContainer}>
                    <h2 className="typography-titles-subtitle">Total Cases</h2>
                    <div className={styles.countContainer}>
                        <p className={styles.title}>
                            {caseCount?.nigoCount?.toLocaleString()}
                        </p>
                        <p
                            className={clsx(
                                'typography-titles-subtitle',
                                styles.totalPercent
                            )}
                        >
                            {Math.round(percentNigoOfTotal)}% of open cases are
                            not in good order (NIGO)
                        </p>
                    </div>
                </div>
                {totalCaseCountLoading ? null : (
                    <PieChart
                        series={pieSeries}
                        colors={['#00628B', '#ABDCFB']}
                        showPercentage={true}
                    />
                )}
            </div>
        </BlurOverlayLoader>
    );
};
