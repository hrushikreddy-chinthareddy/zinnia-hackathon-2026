import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { useEffect, useState } from 'react';

import { DashboardStatsElementResponse, Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { getCaseDashboardStats } from '@deps/queries/api/cases';

dayjs.extend(customParseFormat);
dayjs.extend(weekOfYear);

type CarrierOrBrokerDealerName = string;
type ExceptionCategory = string;

export type MappedExceptionData = {
    totalCasesByCarrier: { [key: CarrierOrBrokerDealerName]: number };
    // Total Nigos Carrier
    total: { [key: CarrierOrBrokerDealerName]: number };
    // Daily Nigos Carrier
    daily: { [key: CarrierOrBrokerDealerName]: [number, number | null][] };
    weekly: { [key: CarrierOrBrokerDealerName]: number[] };
    // Monthly Nigos Carrier
    monthly: { [key: CarrierOrBrokerDealerName]: (number | null)[] };
    startMonth: number; // Index of the first month to be included in the chart
    startYear: number; // Year of the first date to be included in the chart
    carriers: CarrierOrBrokerDealerName[]; // List of carriers sorted by total cases, descending
    exceptionCategories: ExceptionCategory[]; // List of exception categories that came back
    totalMonths: number; // Number of months to be included in the chart
};

const getArrayIndexFromDate = (date: string, startDate: string, unitOfTime: 'month' | 'week' | 'day' = 'day'): number => {
    const dateToStart = dayjs(startDate, 'YYYY-M-D').startOf(unitOfTime);

    return dayjs(date, 'YYYY-M-D').diff(dateToStart, unitOfTime);
};

const useExceptionData = ({
    startDate,
    processSubType,
    carrierOrBrokerDealer = GroupByOptions.Carrier,
}: {
    startDate: string;
    processSubType?: string;
    carrierOrBrokerDealer?: GroupByOptions.Carrier | GroupByOptions.BrokerDealerName;
}) => {
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<MappedExceptionData>();
    const [statsResponse, setStatsResponse] = useState<{ data: DashboardStatsElementResponse[]; createdDateStart: string }>();

    useEffect(() => {
        const createdDateStart = dayjs(startDate).toISOString();
        const fetchData = async () => {
            try {
                // Grab the case stats
                const { data } = await getCaseDashboardStats({
                    filter: {
                        createdDateStart: createdDateStart,
                        process: [Processes.NewBusiness],
                        caseStatus: [Statuses.Completed],
                        ...(processSubType ? { processSubType: [processSubType] } : {}),
                    },
                    groupBy: [carrierOrBrokerDealer, GroupByOptions.ExceptionCategory, GroupByOptions.UpdatedAt],
                });

                if (!data || !(data as DashboardStatsElementResponse[])?.length) {
                    throw new Error('No data found');
                }

                setStatsResponse({ data: data as DashboardStatsElementResponse[], createdDateStart });
            } catch (e) {
                console.error('Error fetching chart data', e);
                setLoading(false);
            }
        };

        setLoading(true);
        fetchData();
    }, [carrierOrBrokerDealer, startDate, processSubType]);

    // function structureData(data: DashboardStatsElementResponse[], createdDateStart: string) {
    //     const parsedResponse: MappedExceptionData = {
    //         totalCasesByCarrier: {},
    //         total: {},
    //         daily: {},
    //         weekly: {},
    //         monthly: {},
    //         startMonth: dayjs(createdDateStart).month(),
    //         startYear: dayjs(createdDateStart).year(),
    //         carriers: [],
    //         exceptionCategories: [],
    //         totalMonths: maxMonthIndex + 1,
    //     };

    //     if ((data as DashboardStatsElementResponse[]).length) {
    //         (data as DashboardStatsElementResponse[]).forEach(carrierGroup => {
    //             const carrier = carrierGroup.name;
    //             parsedResponse.carriers.push(carrier);
    //             parsedResponse.totalCasesByCarrier[carrier] = carrierGroup.count;
    //             carrierGroup.values?.forEach(exceptionGroup => {

    //             });
    //         }
    //     }

    // }

    useEffect(() => {
        if (!statsResponse) {
            return;
        }
        const { data, createdDateStart } = statsResponse;
        // Get the number of elements we'll need for the charts based on current date and start date
        const maxDayIndex = getArrayIndexFromDate(dayjs().format('YYYY-MM-DD'), createdDateStart);
        const maxWeekIndex = getArrayIndexFromDate(dayjs().format('YYYY-MM-DD'), createdDateStart, 'week');
        const maxMonthIndex = getArrayIndexFromDate(dayjs().format('YYYY-MM-DD'), createdDateStart, 'month');

        console.log('data', data);
        // Set up default data
        const parsedResponse: MappedExceptionData = {
            totalCasesByCarrier: {},
            total: {},
            daily: {},
            weekly: {},
            monthly: {},
            startMonth: dayjs(createdDateStart).month(),
            startYear: dayjs(createdDateStart).year(),
            carriers: [],
            exceptionCategories: [],
            totalMonths: maxMonthIndex + 1,
        };

        if ((data as DashboardStatsElementResponse[]).length) {
            (data as DashboardStatsElementResponse[]).forEach(carrierGroup => {
                const carrier = carrierGroup.name;
                parsedResponse.carriers.push(carrier);
                parsedResponse.totalCasesByCarrier[carrier] = carrierGroup.count;
                carrierGroup.values?.forEach(exceptionGroup => {
                    // const exCat = exceptionGroup.name;
                    // initialize the objects for the carrier
                    parsedResponse.total[carrier] = 0;
                    // Build up the arrays for daily and monthly charts (filled with nulls)
                    parsedResponse.daily[carrier] = Array(maxDayIndex + 1)
                        .fill(null)
                        .map((val, index) => [dayjs(createdDateStart).add(index, 'day').unix() * 1000, 0]);

                    parsedResponse.weekly[carrier] = Array(maxWeekIndex + 1)
                        .fill(null)
                        .map((val, index) => 0);
                    parsedResponse.monthly[carrier] = Array(maxMonthIndex + 1).fill(null);

                    let totalNigos = 0;
                    exceptionGroup.values?.forEach(dayGroup => {
                        const dayIndex = getArrayIndexFromDate(dayGroup.name, createdDateStart);
                        const weekIndex = getArrayIndexFromDate(dayGroup.name, createdDateStart, 'week');
                        const monthIndex = getArrayIndexFromDate(dayGroup.name, createdDateStart, 'month');

                        if (dayGroup.count) {
                            totalNigos += dayGroup.count;
                            parsedResponse.total[carrier] += dayGroup.count;
                            parsedResponse.daily[carrier][dayIndex] = [dayjs(dayGroup.name, 'YYYY-MM-DD').unix() * 1000, dayGroup.count];
                            (parsedResponse.weekly[carrier][weekIndex] = dayGroup.count + (parsedResponse.weekly[carrier][weekIndex] || 0)),
                                (parsedResponse.monthly[carrier][monthIndex] =
                                    dayGroup.count + (parsedResponse.monthly[carrier][monthIndex] || 0));
                        }
                    });
                    parsedResponse.total[carrier] = totalNigos;
                });
            });
            parsedResponse.carriers.sort((a, b) => parsedResponse.totalCasesByCarrier[b] - parsedResponse.totalCasesByCarrier[a]);
        }
        console.log('parsedResponse', parsedResponse);
        setChartData(parsedResponse);
        setLoading(false);
    }, [statsResponse]);
    return [loading, chartData, statsResponse?.data] as [
        boolean,
        MappedExceptionData | undefined,
        DashboardStatsElementResponse[] | undefined
    ];
};

export default useExceptionData;
