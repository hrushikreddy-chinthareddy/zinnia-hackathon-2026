import { useQuery } from '@tanstack/react-query';
import {
    createContext,
    FC,
    PropsWithChildren,
    useEffect,
    useState,
} from 'react';

import { ExtendedProcesses } from '@deps/components/dashboard/filters/case-type-filter';
import { useTimeRangeFilter } from '@deps/components/dashboard/filters/time-filter/useTimeRangeFilter';
import {
    createBaseQuery,
    defaultDateFormat,
    formatProcessFilter,
    startDates,
    TimeframeFilterOptions,
} from '@deps/components/dashboard/utils';
import { Processes, Statuses } from '@deps/models/case/case';
import { useDashboardStore } from '@deps/store/store';
import { getCarrierNameByClientId } from '@deps/utils/carriers';
import { startOfTomorrowLocalIso } from '@deps/utils/dates';
import {
    CaseCountGroupByEnum,
    CaseCountInputFilter,
    CaseCountOutput,
} from '@zinnia/api-types/types/analytics';

interface TransactionTrendsContextTypes {
    timeframeRadio: TimeframeFilterOptions | undefined;
    handleTimeframeRadioChange: (value: TimeframeFilterOptions) => void;

    setGroupBy: (value: CaseCountGroupByEnum) => void;
    groupBy: CaseCountGroupByEnum;
    selectedProcess: Processes | ExtendedProcesses | undefined;
    setSelectedProcess: (value: Processes | ExtendedProcesses) => void;
    transactionTrendsData: CaseCountOutput | undefined;
    transactionTrendsDataFetching: boolean;
    filter: CaseCountInputFilter;
    transactionTrendsDataError: Error | null;
    timerange: {
        to: string;
        from: string;
    };
    handleRangeChange: (value: { from: string; to: string }) => void;
}

const defaultState = {
    timeframeRadio: TimeframeFilterOptions.Trailing12Months,
    handleTimeframeRadioChange: () => {},

    transactionTrendsData: undefined,

    transactionTrendsDataFetching: false,
    transactionTrendsDataError: null,
    selectedProcess: Processes.NewBusiness,
    setSelectedProcess: () => {},
    setGroupBy: () => {},
    groupBy: CaseCountGroupByEnum.PROCESS_SUB_TYPE,
    filter: {},
    timerange: {
        to: '',
        from: '',
    },
    handleRangeChange: () => {},
};

export const TransactionTrendsContext =
    createContext<TransactionTrendsContextTypes>(defaultState);

export const TransactionTrendsProvider: FC<PropsWithChildren> = ({
    children,
}) => {
    const { selectedBrokerDealers, selectedCarriers } = useDashboardStore(
        (state) => state
    );

    const [selectedProcess, setSelectedProcess] = useState<
        Processes | ExtendedProcesses
    >(Processes.NewBusiness);
    const [groupBy, setGroupBy] = useState<CaseCountGroupByEnum>(
        selectedCarriers.length
            ? CaseCountGroupByEnum.PROCESS_SUB_TYPE
            : CaseCountGroupByEnum.CARRIER
    );

    const {
        timeframeRadio,
        timerange,
        handleTimeframeRadioChange,
        handleRangeChange,
    } = useTimeRangeFilter<TimeframeFilterOptions>({
        startDates,
        defaultOption: TimeframeFilterOptions.Trailing12Months,
        dateFormat: defaultDateFormat,
    });

    const filter = {
        updatedDateStart: timerange.from,
        updatedDateEnd: startOfTomorrowLocalIso(timerange.to),
        process: formatProcessFilter(selectedProcess),
        caseStatus: [Statuses.Completed, Statuses.Canceled],
        carrier: selectedCarriers,
        brokerDealerName: selectedBrokerDealers,
    };

    const {
        data: transactionTrendsData,
        isFetching: transactionTrendsDataFetching,
        error: transactionTrendsDataError,
    } = useQuery({
        queryKey: ['transactionTrends', filter, groupBy],
        placeholderData: (previousData) => previousData,
        queryFn: () =>
            createBaseQuery(filter, [
                groupBy,
                CaseCountGroupByEnum.UPDATED_DAY,
            ]),
        enabled: Object.keys(filter).length > 0,
        select: (response) => {
            // Transform carrier IDs to names when groupBy is CARRIER
            if (
                groupBy === CaseCountGroupByEnum.CARRIER &&
                response?.data?.length
            ) {
                return {
                    ...response,
                    data: response.data.map((item) => ({
                        ...item,
                        name: getCarrierNameByClientId(item.name) || item.name,
                    })),
                };
            }

            return response;
        },
    });

    // If there is a selected carrier, default to the product name. Otherwise back to carrier
    useEffect(() => {
        if (selectedCarriers && selectedCarriers.length) {
            setGroupBy(CaseCountGroupByEnum.PROCESS_SUB_TYPE);
        } else {
            setGroupBy(CaseCountGroupByEnum.CARRIER);
        }
    }, [selectedCarriers]);

    return (
        <TransactionTrendsContext.Provider
            value={{
                timeframeRadio,
                handleTimeframeRadioChange,
                setGroupBy,
                groupBy,
                selectedProcess,
                setSelectedProcess,
                transactionTrendsData,
                transactionTrendsDataFetching,
                transactionTrendsDataError,
                filter,
                timerange,
                handleRangeChange,
            }}
        >
            {children}
        </TransactionTrendsContext.Provider>
    );
};
