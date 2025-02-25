import clsx from 'clsx';
import { FC } from 'react';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { OpenTransactions } from '@deps/components/dashboard/open-transactions/open-transactions';
import SankeyChart from '@deps/components/dashboard/sankey-chart/sankey-chart';
import CardContainer from '@deps/containers/card-container/card-container';
import { Statuses } from '@deps/models/case/case';
import styles from '@deps/pages/dashboard/Dashboard.module.css';
import { DashboardSearchFilter } from '@deps/queries/cases';
import { useDashboardStore } from '@deps/store/store';

export const ActiveApplications: FC = () => {
    const { selectedCarriers, selectedBrokerDealers } = useDashboardStore(state => state);
    const carriers = Object.keys(selectedCarriers);
    const brokers = Object.keys(selectedBrokerDealers);
    const baseFilter: DashboardSearchFilter = {
        caseStatus: [Statuses.InProgress, Statuses.Exception, Statuses.NotStarted],
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
                    containerClassNames={clsx(sharedStyles.dashboardCard, sharedStyles.dashboardCardFirst)}
                >
                    <SankeyChart key={JSON.stringify(baseFilter)} baseDashboardQueryFilter={baseFilter} />
                </CardContainer>
            </div>

            <OpenTransactions />
        </>
    );
};
