import { useQuery } from '@tanstack/react-query';
import { ExceptionCountGroupByEnum } from '@zinnia/api-types/types/analytics';
import { useState } from 'react';

import { TreeMapInsights } from '@deps/components/dashboard/charts/tree-map-insights';
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import {
    CaseTypeFilter,
    ExtendedProcesses,
} from '@deps/components/dashboard/filters/case-type-filter';
import { TimeFilter } from '@deps/components/dashboard/filters/time-filter/time-filter';
import {
    TimeframeFilterOptions,
    startDates,
    formatProcessFilter,
} from '@deps/components/dashboard/utils';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import CardContainer from '@deps/containers/card-container/card-container';
import { Processes, Statuses } from '@deps/models/case/case';
import { getExceptionCountQuery } from '@deps/queries/tanstack/dashboard/dashboardQueries';
import { useDashboardStore } from '@deps/store/store';

export const NigoClosedTransactions = () => {
    const { selectedCarriers, selectedBrokerDealers } = useDashboardStore(
        (state) => state
    );
    const [selectedProcess, setSelectedProcess] = useState<
        Processes | ExtendedProcesses
    >(Processes.NewBusiness);
    const [timeframeRadio, setTimeframeRadio] = useState<
        TimeframeFilterOptions | undefined
    >(TimeframeFilterOptions.Trailing12Months);

    const [timerange, setTimerange] = useState({
        from: timeframeRadio !== undefined ? startDates[timeframeRadio] : '',
        to: '',
    });

    const handleTimeframeRadioChange = (value: TimeframeFilterOptions) => {
        setTimeframeRadio(value);
        setTimerange({
            from: startDates[value],
            to: '',
        });
    };

    const handleRangeChange = (value: { from: string; to: string }) => {
        setTimerange(value);
        setTimeframeRadio(undefined);
    };

    const filter = {
        caseStatus: [Statuses.Completed],
        carrier: Object.keys(selectedCarriers),
        brokerDealerName: Object.keys(selectedBrokerDealers),
        createdDateStart: timerange.from,
        process: formatProcessFilter(selectedProcess),
    };

    const {
        data: insightExceptionStats,
        isFetching: insightExceptionStatsFetching,
    } = useQuery({
        queryKey: ['exceptionStats', filter],
        queryFn: async () => {
            const response = await getExceptionCountQuery(filter, [
                ExceptionCountGroupByEnum.EXCEPTION_CATEGORY,
            ]);
            if (response?.data?.length) {
                response.data = response?.data?.filter(
                    (item) => item.name !== ''
                );
            }

            return response;
        },
        placeholderData: (previousData) => previousData,
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
                                <TimeFilter
                                    timerange={timerange}
                                    defaultValue={timeframeRadio}
                                    controlledTimeValue={timeframeRadio}
                                    onRadioChange={(val) =>
                                        handleTimeframeRadioChange(
                                            val as TimeframeFilterOptions
                                        )
                                    }
                                    handleTimerangeChange={handleRangeChange}
                                />
                            </div>
                        </div>
                    }
                />
            </BlurOverlayLoader>
        </CardContainer>
    );
};
