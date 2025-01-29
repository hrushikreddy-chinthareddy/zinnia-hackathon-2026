import { FC, RefObject } from 'react';

import { OpenTransactions } from '@deps/components/dashboard/open-transactions/open-transactions';
import SankeyChart from '@deps/components/dashboard/sankey-chart/sankey-chart';
import CardContainer from '@deps/containers/card-container/card-container';
import { useResizeObserver } from '@deps/hooks/useResizeObserver';
import { Statuses } from '@deps/models/case/case';
import styles from '@deps/pages/dashboard/Dashboard.module.css';
import { DashboardSearchFilter } from '@deps/queries/cases';
import { useDashboardStore } from '@deps/store/store';

interface ActiveApplicationsProps {
    carrierHeaderRef: RefObject<HTMLElement>;
    authorizedCarriers: string[];
}

export const ActiveApplications: FC<ActiveApplicationsProps> = ({ carrierHeaderRef, authorizedCarriers }) => {
    const { height: carrierHeaderHeight } = useResizeObserver({ ref: carrierHeaderRef, box: 'border-box' });

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
            <div className="relative border-t-2 border-[--color-base-border-border-light]">
                <div className={styles.container}>
                    <CardContainer classNames="relative !pt-0" containerClassNames="mt-none">
                        <SankeyChart key={JSON.stringify(baseFilter)} baseDashboardQueryFilter={baseFilter} />
                    </CardContainer>
                </div>
            </div>

            <OpenTransactions
                authorizedCarriers={authorizedCarriers}
                baseDashboardQueryFilter={baseFilter}
                carrierHeaderHeight={carrierHeaderHeight}
            />
        </>
    );
};
