import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { TreeMapInsights } from '@deps/components/dashboard/charts/tree-map-insights';
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { CaseTypeFilter } from '@deps/components/dashboard/filters/case-type-filter';
import { TimeFilter } from '@deps/components/dashboard/filters/time-filter/time-filter';
import { TimeframeFilterOptions, startDates, formatProcessFilter, createBaseQuery } from '@deps/components/dashboard/utils';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import CardContainer from '@deps/containers/card-container/card-container';
import { Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { DashboardSearchFilter } from '@deps/queries/cases';
import { useDashboardStore } from '@deps/store/store';

export const NigoClosedTransactions = () => {
    const { selectedCarriers, selectedBrokerDealers } = useDashboardStore(state => state);
    const [selectedProcess, setSelectedProcess] = useState<Processes | undefined>(Processes.NewBusiness);
    const [timeframe, setTimeframe] = useState<TimeframeFilterOptions>(TimeframeFilterOptions.Trailing12Months);

    const filter: DashboardSearchFilter = {
        caseStatus: [Statuses.Completed],
        carrier: Object.keys(selectedCarriers),
        brokerDealerName: Object.keys(selectedBrokerDealers),
        createdDateStart: startDates[timeframe],
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
                        <div className={sharedStyles.filterContainer}>
                            <div className="w-1/2">
                                <CaseTypeFilter
                                    onValueChange={setSelectedProcess}
                                    caseStatus={[Statuses.Completed]}
                                    defaultProcess={Processes.NewBusiness}
                                />
                            </div>
                            <div className="w-1/2">
                                <TimeFilter defaultValue={timeframe} onValueChange={val => setTimeframe(val as TimeframeFilterOptions)} />
                            </div>
                        </div>
                    }
                />
            </BlurOverlayLoader>
        </CardContainer>
    );
};
