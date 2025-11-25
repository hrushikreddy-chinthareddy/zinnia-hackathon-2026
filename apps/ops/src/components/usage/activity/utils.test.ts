import { UserTransactionOutputLevel1 } from '@zinnia/api-types/types/analytics';

import {
    aggregateByCategory,
    getTransactionTypesByCategory,
    buildTopLevelSeries,
    buildDrilldownSeries,
} from './utlis';
import { colors } from '../utils';

const mockTransactionData: UserTransactionOutputLevel1[] = [
    {
        key: 'carrier',
        name: 'Carrier A',
        count: 500,
        values: [
            {
                key: 'transactionCategory',
                name: 'financial',
                count: 300,
                values: [
                    { key: 'transactionType', name: 'premium', count: 150 },
                    { key: 'transactionType', name: 'loan', count: 100 },
                    { key: 'transactionType', name: 'withdrawal', count: 50 },
                ],
            },
            {
                key: 'transactionCategory',
                name: 'policy_update',
                count: 150,
                values: [
                    { key: 'transactionType', name: 'email', count: 80 },
                    { key: 'transactionType', name: 'address', count: 70 },
                ],
            },
            {
                key: 'transactionCategory',
                name: 'non_financial',
                count: 50,
                values: [
                    { key: 'transactionType', name: 'death_claim', count: 30 },
                    { key: 'transactionType', name: 'free_look', count: 20 },
                ],
            },
        ],
    },
    {
        key: 'carrier',
        name: 'Carrier B',
        count: 300,
        values: [
            {
                key: 'transactionCategory',
                name: 'financial',
                count: 200,
                values: [
                    { key: 'transactionType', name: 'premium', count: 120 },
                    { key: 'transactionType', name: 'surrender', count: 80 },
                ],
            },
            {
                key: 'transactionCategory',
                name: 'policy_update',
                count: 100,
                values: [
                    { key: 'transactionType', name: 'name', count: 60 },
                    { key: 'transactionType', name: 'phone', count: 40 },
                ],
            },
        ],
    },
];

describe('aggregateByCategory', () => {
    it('should aggregate transaction counts by category across all carriers', () => {
        const result = aggregateByCategory(mockTransactionData, colors);

        expect(result).toHaveLength(3);

        // Should be sorted by count descending
        expect(result[0]).toEqual({
            category: 'financial',
            displayName: 'Payments & Distributions',
            count: 500, // 300 + 200
            color: colors[0],
        });

        expect(result[1]).toEqual({
            category: 'policy_update',
            displayName: 'Party Management',
            count: 250, // 150 + 100
            color: colors[1],
        });

        expect(result[2]).toEqual({
            category: 'non_financial',
            displayName: 'Policy & Contract Servicing',
            count: 50,
            color: colors[2],
        });
    });

    it('should handle empty data', () => {
        const result = aggregateByCategory([], colors);
        expect(result).toEqual([]);
    });
});

describe('getTransactionTypesByCategory', () => {
    it('should return transaction types for a specific category', () => {
        const result = getTransactionTypesByCategory(
            mockTransactionData,
            'financial'
        );

        expect(result).toHaveLength(4);

        // Should be sorted by count descending
        expect(result[0]).toEqual({
            type: 'premium',
            displayName: 'Premium',
            count: 270, // 150 + 120
        });

        expect(result[1]).toEqual({
            type: 'loan',
            displayName: 'Loan',
            count: 100,
        });

        expect(result[2]).toEqual({
            type: 'surrender',
            displayName: 'Surrender',
            count: 80,
        });

        expect(result[3]).toEqual({
            type: 'withdrawal',
            displayName: 'Withdrawal',
            count: 50,
        });
    });

    it('should return empty array for non-existent category', () => {
        const result = getTransactionTypesByCategory(
            mockTransactionData,
            'non_existent_category'
        );

        expect(result).toEqual([]);
    });

    it('should return transaction types for policy_update category', () => {
        const result = getTransactionTypesByCategory(
            mockTransactionData,
            'policy_update'
        );

        expect(result).toHaveLength(4);
        expect(result[0].type).toBe('email');
        expect(result[0].count).toBe(80);
    });
});

describe('buildTopLevelSeries', () => {
    it('should build top-level series with drilldown points', () => {
        const categories = [
            {
                category: 'financial',
                displayName: 'Financial',
                count: 500,
                color: '#00628B',
            },
            {
                category: 'policy_update',
                displayName: 'Policy Update',
                count: 250,
                color: '#67B8D6',
            },
        ];

        const result = buildTopLevelSeries(categories);

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Transactions');
        expect(result[0].colorByPoint).toBe(true);
        expect(result[0].data).toHaveLength(2);

        expect(result[0].data[0]).toEqual({
            name: 'Financial',
            y: 500,
            color: '#00628B',
            drilldown: 'financial',
        });

        expect(result[0].data[1]).toEqual({
            name: 'Policy Update',
            y: 250,
            color: '#67B8D6',
            drilldown: 'policy_update',
        });
    });

    it('should handle empty categories', () => {
        const result = buildTopLevelSeries([]);

        expect(result).toHaveLength(1);
        expect(result[0].data).toEqual([]);
    });
});

describe('buildDrilldownSeries', () => {
    it('should build drilldown series for each category', () => {
        const dataByCategory = {
            financial: [
                { type: 'premium', displayName: 'Premium', count: 270 },
                { type: 'loan', displayName: 'Loan', count: 100 },
            ],
            policy_update: [
                { type: 'email', displayName: 'Email', count: 80 },
                { type: 'address', displayName: 'Address', count: 70 },
            ],
        };

        const result = buildDrilldownSeries(dataByCategory);

        expect(result).toHaveLength(2);

        // Financial series
        expect(result[0]).toEqual({
            type: 'column',
            id: 'financial',
            name: 'Payments & Distributions',
            data: [
                { name: 'Premium', y: 270 },
                { name: 'Loan', y: 100 },
            ],
        });

        // Policy Update series
        expect(result[1]).toEqual({
            type: 'column',
            id: 'policy_update',
            name: 'Party Management',
            data: [
                { name: 'Email', y: 80 },
                { name: 'Address', y: 70 },
            ],
        });
    });

    it('should handle empty data', () => {
        const result = buildDrilldownSeries({});
        expect(result).toEqual([]);
    });
});
