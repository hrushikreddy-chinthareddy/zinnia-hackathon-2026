import { UserViewsOutputLevel1 } from '@xd/api-types/dist/generated-types/analytics';

import { generateChartSeries, getCategories } from './utlis';

const mockData: UserViewsOutputLevel1[] = [
    {
        key: 'userRole',
        name: 'Call Center',
        count: 1534,
        values: [
            { key: 'process', name: 'Claims', count: 19 },
            { key: 'process', name: 'Correspondence', count: 206 },
            { key: 'process', name: 'New Business', count: 1164 },
            { key: 'process', name: 'Outgoing Fund Transfer', count: 25 },
            { key: 'process', name: 'Policy Update', count: 16 },
            { key: 'process', name: 'Qualification', count: 9 },
            { key: 'process', name: 'Renewal', count: 13 },
            { key: 'process', name: 'Loan', count: 200 },
            {
                key: 'process',
                name: 'Required Minimum Distribution',
                count: 11,
            },
            { key: 'process', name: 'Systematic Program Update', count: 30 },
            { key: 'process', name: 'Withdrawal', count: 41 },
        ],
    },
    {
        key: 'userRole',
        name: 'Undefined',
        count: 45,
        values: [
            { key: 'process', name: 'Claims', count: 12 },
            { key: 'process', name: 'New Business', count: 3 },
        ],
    },
];

describe('getCategories', () => {
    it('should return sorted unique categories from all user roles', () => {
        const categories = getCategories(mockData);

        expect(categories).toEqual([
            'Claims',
            'Correspondence',
            'Loan',
            'New Business',
            'Outgoing Fund Transfer',
            'Policy Update',
            'Qualification',
            'Renewal',
            'Required Minimum Distribution',
            'Systematic Program Update',
            'Withdrawal',
        ]);
    });
});

describe('generateChartSeries', () => {
    it('should return chart series data for valid user roles excluding "Undefined"', () => {
        const categories = getCategories(mockData);
        const series = generateChartSeries(mockData, categories);

        expect(series).toEqual([
            {
                type: 'column',
                name: 'Call Center',
                data: [
                    19, // Claims
                    206, // Correspondence
                    200, // Loan
                    1164, // New Business
                    25, // Outgoing Fund Transfer
                    16, // Policy Update
                    9, // Qualification
                    13, // Renewal
                    11, // Required Minimum Distribution
                    30, // Systematic Program Update
                    41, // Withdrawal
                ],
            },
        ]);
    });

    it('should return an empty array if no valid roles are found', () => {
        const dataWithOnlyUndefined = mockData.filter(
            (d) => d.name === 'Undefined'
        );
        const categories = getCategories(dataWithOnlyUndefined);
        const series = generateChartSeries(dataWithOnlyUndefined, categories);

        expect(series).toEqual([]);
    });
});
