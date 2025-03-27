import { SeriesOptionsType } from 'highcharts';

import { DashboardStatsElementResponse } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { DashboardSearchFilter } from '@deps/queries/cases';
import { getCaseDashboardStatsQuery } from '@deps/queries/tanstack/dashboard/dashboardQueries';

type TransformedData = {
    [key: string]: { [key: string]: number };
};

export const submissionTypeQuery = async (baseInsightQueryFilter: DashboardSearchFilter, groupBy: GroupByOptions[]) => {
    const response = await getCaseDashboardStatsQuery(baseInsightQueryFilter, groupBy);
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

// Application Type
export const transformData = (data: DashboardStatsElementResponse[]): TransformedData => {
    return data.reduce((result, item) => {
        const parentName = item.name; // "MASS"
        const childValues = item.values || []; // Array of { name: "Electronic", count: 6634 }, etc.

        result[parentName] = childValues.reduce((childResult, child) => {
            childResult[child.name] = child.count; // Map name to count
            return childResult;
        }, {} as Record<string, number>);

        return result;
    }, {} as TransformedData);
};

export const generateSeries = (transformedData: TransformedData): SeriesOptionsType[] => {
    const applicationTypeCategories = Object.keys(transformedData); // e.g., ["MASS", "ANOTHER"]
    const applicationTypeColors: Record<string, string> = {
        Digital: '#00628B',
        ['Electronic (E-App)']: '#85BCD3',
        Paper: '#021936',
    };
    // Find all unique application types (e.g., "Electronic", "Digital", "Paper")
    const allApplicationTypes = Array.from(new Set(applicationTypeCategories.flatMap(category => Object.keys(transformedData[category]))));

    // Create the series
    const series: SeriesOptionsType[] = allApplicationTypes.map(applicationType => {
        const data = applicationTypeCategories.map(category => {
            // Use 0 if the value for the applicationType is missing
            return transformedData[category][applicationType] || 0;
        });

        return {
            name: applicationType === 'Electronic' ? 'Electronic (E-App)' : applicationType,
            color: applicationTypeColors[applicationType],
            type: 'bar',
            data,
            legendIndex: allApplicationTypes.indexOf(applicationType),
        };
    });

    return series;
};

// The API returns digital and electronic. We need to combien the data set to make them both just say "Electronic (E-App)"
export const combineElectronicAndDigital = (data: DashboardStatsElementResponse[]): DashboardStatsElementResponse[] => {
    const combinedData: Record<string, DashboardStatsElementResponse> = {};

    data.forEach(item => {
        if (item.name === 'Electronic' || item.name === 'Digital') {
            const combinedName = 'Electronic (E-App)';
            if (!combinedData[combinedName]) {
                combinedData[combinedName] = { ...item, name: combinedName, count: 0 };
            }
            combinedData[combinedName].count += item.count;
        } else {
            combinedData[item.name] = item;
        }

        // Recursively process nested values
        if (item.values && item.values.length > 0) {
            combinedData[item.name].values = combineElectronicAndDigital(item.values);
        }
    });

    return Object.values(combinedData);
};
