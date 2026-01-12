import clsx from 'clsx';
import { FC } from 'react';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { ActiveAging } from '@deps/components/dashboard/sections/active-aging/active-aging';
import SankeyChart from '@deps/components/dashboard/sections/sankey-chart/sankey-chart';
import { SubmissionType } from '@deps/components/dashboard/sections/submission-type/submission-type';
import CardContainer from '@deps/containers/card-container/card-container';
import { oneYearAgoISO } from '@deps/helpers/dashboard/dashboard-helpers';
import { Statuses } from '@deps/models/case/case';
import styles from '@deps/pages/analytics/Dashboard.module.css';
import { useDashboardStore } from '@deps/store/store';
import { CaseCountInputFilter } from '@zinnia/api-types/types/analytics';

export const ActiveApplications: FC = () => {
    const { selectedCarriers, selectedBrokerDealers } = useDashboardStore(
        (state) => state
    );
    const carriers = selectedCarriers;
    const brokers = selectedBrokerDealers;
    const baseFilter: CaseCountInputFilter = {
        caseStatus: [
            Statuses.InProgress,
            Statuses.Exception,
            Statuses.NotStarted,
        ],
        createdDateStart: oneYearAgoISO,
    };
    if (selectedCarriers && carriers.length) {
        baseFilter.carrier = carriers;
    }

    if (selectedBrokerDealers && brokers.length) {
        baseFilter.brokerDealerName = brokers;
    }

    return (
        <>
            <div className={styles.container}>
                <CardContainer
                    classNames="relative !pt-0"
                    containerClassNames={clsx(
                        sharedStyles.dashboardCard,
                        sharedStyles.dashboardCardFirst
                    )}
                >
                    <SankeyChart
                        key={JSON.stringify(baseFilter)}
                        baseDashboardQueryFilter={baseFilter}
                    />
                </CardContainer>
            </div>

            <div className={styles.container}>
                <div className={sharedStyles.dashboardCard}>
                    <ActiveAging />
                </div>
                <div className={sharedStyles.dashboardCard}>
                    <SubmissionType />
                </div>
            </div>
        </>
    );
};
