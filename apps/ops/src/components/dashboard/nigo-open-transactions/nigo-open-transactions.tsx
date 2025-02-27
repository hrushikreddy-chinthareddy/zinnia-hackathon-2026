import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { CaseTypeFilter } from '@deps/components/dashboard/case-type-filter';
import { TreeMapInsights } from '@deps/components/dashboard/tree-map-insights';
import { createBaseQuery, formatProcessFilter } from '@deps/components/dashboard/utils';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import CardContainer from '@deps/containers/card-container/card-container';
import { getStartAndEndDates } from '@deps/containers/case-redesign-sub-page/case-helpers';
import { Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { DashboardSearchFilter } from '@deps/queries/cases';
import { useDashboardStore } from '@deps/store/store';

export const NigoOpenTransactions = () => {
    const { createdDateStart } = getStartAndEndDates('All');
    const { selectedCarriers, selectedBrokerDealers } = useDashboardStore(state => state);
    const [selectedProcess, setSelectedProcess] = useState<Processes | undefined>(Processes.NewBusiness);

    const filter: DashboardSearchFilter = {
        caseStatus: [Statuses.InProgress, Statuses.Exception, Statuses.NotStarted],
        carrier: Object.keys(selectedCarriers),
        brokerDealerName: Object.keys(selectedBrokerDealers),
        createdDateStart,
        process: formatProcessFilter(selectedProcess),
    };

    const { data: insightExceptionStats, isFetching: insightExceptionStatsFetching } = useQuery({
        queryKey: ['exceptionStats', filter],
        queryFn: async () => {
            const response = await createBaseQuery(filter, [GroupByOptions.ExceptionCategory]);
            if (response?.data?.length) {
                response.data = response?.data?.filter(item => item.name !== '');
            }

            return response;
        },
        placeholderData: previousData => previousData,
        enabled: Object.keys(filter).length > 0,
    });
    return (
        <CardContainer fullWidth={false}>
            <BlurOverlayLoader loading={insightExceptionStatsFetching}>
                <TreeMapInsights
                    dashboardStatsData={insightExceptionStats}
                    heading="NIGO Distribution"
                    FilterComponents={
                        <div className="w-1/4">
                            <CaseTypeFilter
                                onValueChange={setSelectedProcess}
                                caseStatus={[Statuses.InProgress, Statuses.Exception, Statuses.NotStarted]}
                                defaultProcess={Processes.NewBusiness}
                            />
                        </div>
                    }
                />
            </BlurOverlayLoader>
        </CardContainer>
    );
};
