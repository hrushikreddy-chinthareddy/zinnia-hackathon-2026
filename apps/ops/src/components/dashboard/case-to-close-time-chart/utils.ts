import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

import { GroupByOptions } from '@deps/models/case/enums';
import { DashboardSearchFilter } from '@deps/queries/cases';

import sampleData from './sample-data.json';

dayjs.extend(duration);

//TODO: Replace this with actual api spec when api publishes
export interface CaseTimingData {
    key: string;
    name: string;
    secondLow: number;
    secondMedian: number;
    secondMean: number;
    secondHigh: number;
    count: number;
}
//TODO: Implement the real query when its online
export const caseTimingQuery = async (
    _baseInsightQueryFilter: DashboardSearchFilter,
    _groupBy: GroupByOptions[]
): Promise<{ data: CaseTimingData[] }> => {
    const response = sampleData;
    if (!response?.data) {
        console.error(
            'createBaseQuery::An error occurred while getting case dashboard stats results',
            response?.data?.length,
            JSON.stringify(response)
        );
        throw response;
    } else {
        return response;
    }
};

const getDaysFromSeconds = (seconds: number) => dayjs.duration(seconds, 'seconds').asDays();

export const generateSeries = (seriesData: CaseTimingData[]) => {
    return [
        {
            data: seriesData.map(item => {
                const daysFromSeconds = getDaysFromSeconds(item.secondMedian);
                return {
                    name: item.name,
                    y: daysFromSeconds,
                    count: item.count,
                };
            }),
        },
    ];
};
