import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

import { friendlyDateFormat } from '@deps/components/dashboard/utils';
import { CaseCountOutputLevel1 } from '@zinnia/api-types/types/analytics';

export enum ActiveAgingTimeRange {
    ZERO_TO_SIX = '0-6D',
    SEVEN_TO_THIRTEEN = '7-13D',
    FOURTEEN_TO_TWENTYSEVEN = '14-27D',
    TWENTY_EIGHT_PLUS = '28+D',
}

export interface TimeOrganizedData {
    name: string;
    count: number[];
    countByDay: {
        [key: string]: number;
    };
    total: number;
}

export type TimeRangeData = Record<
    ActiveAgingTimeRange,
    { data: TimeOrganizedData[]; total: number }
>;

const LAST_COLUMN_INDEX = 54;
const TWENTY_EIGHT_PLUS_GROUP_BY = 9;
const FOURTEEN_TO_TWENTYSEVEN_GROUP_BY = 2;

dayjs.extend(isBetween);

export const isBetweenTimeRange = (
    endDate: dayjs.Dayjs,
    createdDate: string,
    timeRange: ActiveAgingTimeRange
) => {
    const created = dayjs(createdDate);

    switch (timeRange) {
        case ActiveAgingTimeRange.ZERO_TO_SIX:
            return created.isBetween(
                endDate,
                endDate.subtract(6, 'day'),
                'day',
                '[]'
            );
        case ActiveAgingTimeRange.SEVEN_TO_THIRTEEN:
            return created.isBetween(
                endDate.subtract(7, 'day'),
                endDate.subtract(13, 'day'),
                'day',
                '[]'
            );
        case ActiveAgingTimeRange.FOURTEEN_TO_TWENTYSEVEN:
            return created.isBetween(
                endDate.subtract(14, 'day'),
                endDate.subtract(27, 'day'),
                'day',
                '[]'
            );
        case ActiveAgingTimeRange.TWENTY_EIGHT_PLUS:
            return created.isBefore(endDate.subtract(28, 'day'));

        default:
            return null;
    }
};

/**
 * This helps to generate the series for highcarts.
 *
 * We take in data that looks like this:
 * ```[
    {
        "name": "Incoming Transfer",
        "count": 10000,
        "values": [
            {
                "name": "2023-07-06",
                "count": 10
            }, {
                "name": "2023-07-07",
                "count": 25
            }, {
                "name": "2023-07-08",
                "count": 56
            }
        ]
    }
 ]
    ```

 * And turn it into this:
 * ```
 * {
 *   "0-6": {
 *     data: [
 *     {
 *       "name": "Incoming Transfer",
 *       "count": [10, 25, 56], <-- this matches the x axis categories we have for each day between 0-6, for example. 10 is 0, 25 is 1, etc
 *       "countByDay": {
 *         "2023-07-06": 10,
 *         "2023-07-07": 25,
 *         "2023-07-08": 56
 *       },
 *       "total": 101
 *     }
 *     total: 101
 *   ],
 *   etc
 * ```
 * @param data
 * @returns
 */
export const organizeAndMergeDataByTimeRange = (
    data: CaseCountOutputLevel1[]
): TimeRangeData => {
    const today = dayjs(); // Get the current date

    // Initialize the result object with empty arrays for each time range
    const result: Record<
        ActiveAgingTimeRange,
        {
            data: TimeOrganizedData[];
            total: number;
            countByDay: { [key: string]: number };
        }
    > = {
        [ActiveAgingTimeRange.ZERO_TO_SIX]: {
            data: [],
            total: 0,
            countByDay: {},
        },
        [ActiveAgingTimeRange.SEVEN_TO_THIRTEEN]: {
            data: [],
            total: 0,
            countByDay: {},
        },
        [ActiveAgingTimeRange.FOURTEEN_TO_TWENTYSEVEN]: {
            data: [],
            total: 0,
            countByDay: {},
        },
        [ActiveAgingTimeRange.TWENTY_EIGHT_PLUS]: {
            data: [],
            total: 0,
            countByDay: {},
        },
    };
    // Iterate over each item in the data array
    data.forEach((item) => {
        // Inside each item, iterate over its values array
        item.values?.forEach((value) => {
            // Determine the appropriate time range for the current value's date
            const range = Object.values(ActiveAgingTimeRange).find((range) =>
                isBetweenTimeRange(today, value.name, range)
            );
            if (range) {
                // Check if an item with the same name already exists in the appropriate time range
                const existingItem = result[range].data.find(
                    (resultItem) => resultItem.name === item.name
                );

                if (existingItem) {
                    // If an item with the same name exists, append the count to its count array and update the total
                    existingItem.count.push(value.count);
                    existingItem.countByDay[value.name] = value.count;
                    result[range].total += value.count;
                    existingItem.total += value.count;
                } else {
                    // If no item with the same name exists, create a new entry in the time range array and update the total
                    result[range].data.push({
                        name: item.name,
                        count: [value.count],
                        countByDay: {
                            [value.name]: value.count,
                        },
                        total: value.count,
                    });
                    result[range].total += value.count;
                }
            }
        });
    });

    return result;
};

export const generateActiveAgingCategories = (
    timeRange: ActiveAgingTimeRange
) => {
    switch (timeRange) {
        case ActiveAgingTimeRange.ZERO_TO_SIX:
            return [
                'Today',
                '1 Day',
                '2 Days',
                '3 Days',
                '4 Days',
                '5 Days',
                '6 Days',
            ];
        case ActiveAgingTimeRange.SEVEN_TO_THIRTEEN:
            return [
                '7 Days',
                '8 Days',
                '9 Days',
                '10 Days',
                '11 Days',
                '12 Days',
                '13 Days',
            ];
        case ActiveAgingTimeRange.FOURTEEN_TO_TWENTYSEVEN:
            return [
                '14-15 Days',
                '16-17 Days',
                '18-19 Days',
                '20-21 Days',
                '22-23 Days',
                '24-25 days',
                '26-27 days',
            ];
        case ActiveAgingTimeRange.TWENTY_EIGHT_PLUS:
            return [
                '28-37 Days',
                '38-47 Days',
                '48-57 Days',
                '58-67 Days',
                '68-77 Days',
                '78-87 Days',
                '88+ Days',
            ];
    }
};

/**
 *
 * This generates the active aging series we use with highcharts.
 *
 * it takes in data that we get from `organizeAndMergeDataByTimeRange` like this:
 *
 *
 *
 * ```
  {
    "14-27": {
        data: [
        {
            "name": "Incoming Transfer",
            "count": [10, 25, 56],
            "countByDay": {
                "2023-07-06": 10,
                "2023-07-07": 25,
                "2023-07-08": 56,
                "2023-07-09": 30
            },
            "total": 101
        }
        total: 101
    ],
    etc
 }
```
    and depending on the selected time range, groups count by sets of 2 or 9 and converts it to data like this
    ```
    {
        name: "Incoming Transfer",
        data: [35, 86] //<-- this maps to the columns in highcharts
        type: "column"
    }
        ```
 */
export const generateActiveAgingSeries = (
    timeRange: ActiveAgingTimeRange,
    timeOrganizedData?: TimeRangeData
) => {
    // If no time-organized data is provided, return an empty array.
    if (!timeOrganizedData) {
        return [];
    }

    // Map over each item in the time-organized data.
    return timeOrganizedData[timeRange].data.map((item) => {
        let data: number[];

        // Determine the grouping logic based on the time range.
        switch (timeRange) {
            case ActiveAgingTimeRange.FOURTEEN_TO_TWENTYSEVEN:
                /**
                 * For the 14-27 time range, group every 2 elements together.
                 */
                data = item.count.reduce((acc: number[], value, index) => {
                    // If the index is a multiple of 2, start a new group.
                    if (index % FOURTEEN_TO_TWENTYSEVEN_GROUP_BY === 0) {
                        acc.push(value);
                    } else {
                        // Otherwise, add to the previous group.
                        acc[acc.length - 1] += value;
                    }
                    return acc;
                }, []); // Initialize with an empty array
                break;

            case ActiveAgingTimeRange.TWENTY_EIGHT_PLUS:
                /**
                 * For the 28+ time range, group every 9 elements together.
                 */
                data = item.count.reduce((acc: number[], value, index) => {
                    // If we've reached the last column index, lump all remaining elements together.
                    if (index >= LAST_COLUMN_INDEX) {
                        acc[acc.length - 1] += value;
                    } else {
                        // Otherwise, group by 9.
                        const groupIndex = Math.floor(
                            index / TWENTY_EIGHT_PLUS_GROUP_BY
                        );
                        if (!acc[groupIndex]) {
                            acc[groupIndex] = 0;
                        }
                        acc[groupIndex] += value;
                    }
                    return acc;
                }, []); // Initialize with an empty array
                break;

            default:
                /**
                 * For all other time ranges, simply reverse the data.
                 */
                data = item.count.slice().reverse();
                break;
        }

        // Return the generated series data.
        return {
            name: item.name,
            type: 'column',
            data,
        };
    });
};

export const generateActiveAgingPieChartSeries = (
    timeRangeData: Record<ActiveAgingTimeRange, TimeOrganizedData[]>
) => {
    const result: Record<ActiveAgingTimeRange, number> = {
        [ActiveAgingTimeRange.TWENTY_EIGHT_PLUS]: 0,
        [ActiveAgingTimeRange.FOURTEEN_TO_TWENTYSEVEN]: 0,
        [ActiveAgingTimeRange.SEVEN_TO_THIRTEEN]: 0,
        [ActiveAgingTimeRange.ZERO_TO_SIX]: 0,
    };
    for (const [key, value] of Object.entries(timeRangeData || {})) {
        let count = 0;
        for (const item of value) {
            count += item.count.reduce((total, num) => total + num, 0);
        }
        result[key as ActiveAgingTimeRange] = count;
    }
    return result;
};

// Define the start dates for each time range
export const startDates: Record<ActiveAgingTimeRange, string> = {
    [ActiveAgingTimeRange.ZERO_TO_SIX]: dayjs()
        .subtract(6, 'day')
        .format(friendlyDateFormat),
    [ActiveAgingTimeRange.SEVEN_TO_THIRTEEN]: dayjs()
        .subtract(13, 'day')
        .format(friendlyDateFormat),
    [ActiveAgingTimeRange.FOURTEEN_TO_TWENTYSEVEN]: dayjs()
        .subtract(27, 'day')
        .format(friendlyDateFormat),
    [ActiveAgingTimeRange.TWENTY_EIGHT_PLUS]: dayjs()
        .subtract(1, 'year')
        .format(friendlyDateFormat),
};

// Calculate the end date based on the active aging time range
export const calculateEndDate = (timeRange: ActiveAgingTimeRange): string => {
    const today = dayjs();

    switch (timeRange) {
        case ActiveAgingTimeRange.ZERO_TO_SIX:
            return today.format(friendlyDateFormat);
        case ActiveAgingTimeRange.SEVEN_TO_THIRTEEN:
            return today.subtract(7, 'day').format(friendlyDateFormat);
        case ActiveAgingTimeRange.FOURTEEN_TO_TWENTYSEVEN:
            return today.subtract(14, 'day').format(friendlyDateFormat);
        case ActiveAgingTimeRange.TWENTY_EIGHT_PLUS:
            return today.subtract(28, 'day').format(friendlyDateFormat);
        default:
            return today.format(friendlyDateFormat);
    }
};

// Formats the time ranges in the objet
export const getFormattedDateRange = (
    timeRange: ActiveAgingTimeRange
): { from: string; to: string } => {
    const startDate = dayjs(startDates[timeRange]).format(friendlyDateFormat);
    const endDate = calculateEndDate(timeRange);

    return {
        from: startDate,
        to: endDate,
    };
};
