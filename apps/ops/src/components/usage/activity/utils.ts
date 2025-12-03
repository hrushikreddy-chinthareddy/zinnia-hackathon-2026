import Highcharts from 'highcharts';

import { GroupedColumnSeries } from '@deps/components/dashboard/charts/bar-charts/grouped-column-chart/grouped-column-chart';
import {
    UserTransactionOutputLevel1,
    UserTransactionOutputLevel3,
} from '@zinnia/api-types/types/analytics';

import {
    colors,
    downloadCSV,
    TRANSACTION_CATEGORY_DISPLAY_MAP,
    TRANSACTION_TYPE_DISPLAY_MAP,
} from '../utils';

export const aggregateByCategory = (
    data: UserTransactionOutputLevel1[],
    colors: string[]
): Array<{
    category: string;
    displayName: string;
    count: number;
    color: string;
}> => {
    const categoryTotals = new Map<string, number>();

    // Sum counts across all carriers for each category
    data.forEach((carrier) => {
        carrier.values?.forEach((categoryItem) => {
            if (categoryItem.key === 'transactionCategory') {
                const category = categoryItem.name;
                const currentCount = categoryTotals.get(category) || 0;
                categoryTotals.set(category, currentCount + categoryItem.count);
            }
        });
    });

    // Convert to array and sort by count (descending)
    const result = Array.from(categoryTotals.entries())
        .map(([category, count], idx) => ({
            category,
            displayName:
                TRANSACTION_CATEGORY_DISPLAY_MAP[category?.toLowerCase()] ||
                category,
            count,
            color: colors[idx],
        }))
        .sort((a, b) => b.count - a.count);

    return result;
};

// Get transaction types (subtypes) for a specific category
export const getTransactionTypesByCategory = (
    data: UserTransactionOutputLevel1[],
    selectedCategory: string
): Array<{ type: string; displayName: string; count: number }> => {
    const typeTotals = new Map<string, number>();

    data.forEach((carrier) => {
        carrier.values?.forEach((categoryItem) => {
            if (
                categoryItem.key === 'transactionCategory' &&
                categoryItem.name === selectedCategory
            ) {
                categoryItem.values?.forEach(
                    (typeItem: UserTransactionOutputLevel3) => {
                        if (typeItem.key === 'transactionType') {
                            const type = typeItem.name;
                            const currentCount = typeTotals.get(type) || 0;
                            typeTotals.set(type, currentCount + typeItem.count);
                        }
                    }
                );
            }
        });
    });

    // Convert to array and sort by count (descending)
    return Array.from(typeTotals.entries())
        .map(([type, count]) => ({
            type,
            displayName:
                TRANSACTION_TYPE_DISPLAY_MAP[type?.toLowerCase()] || type,
            count,
        }))
        .sort((a, b) => b.count - a.count);
};

export function buildTopLevelSeries(
    categories: Array<{
        category: string;
        displayName: string;
        count: number;
        color: string;
    }>
): GroupedColumnSeries[] {
    // One series with one point per category. Each point declares a drilldown id.
    return [
        {
            name: 'Transactions',
            colorByPoint: true,
            data: categories.map((c) => ({
                name: c.displayName,
                y: c.count,
                color: c.color,
                drilldown: c.category,
            })),
        },
    ];
}
export function buildDrilldownSeries(
    dataByCategory: Record<
        string,
        Array<{ type: string; displayName: string; count: number }>
    >
): Highcharts.SeriesOptionsType[] {
    // One drilldown series per category id
    return Object.entries(dataByCategory).map(([categoryKey, items]) => ({
        type: 'column',
        id: categoryKey,
        name:
            TRANSACTION_CATEGORY_DISPLAY_MAP[categoryKey?.toLowerCase()] ??
            categoryKey,
        data: items.map((t) => ({
            name: t.displayName,
            y: t.count,
        })),
    }));
}

//CSV Export function
export const PrepareTransactionActivityCSV = (
    data: UserTransactionOutputLevel1[],
    filename = 'Self-Serve-Transaction-Activity.csv'
) => {
    const rows: string[] = ['Transaction Type,Transaction,Total'];

    const categories = aggregateByCategory(data, colors);

    // Export all transaction types for each category
    categories.forEach((category) => {
        const types = getTransactionTypesByCategory(data, category.category);

        types.forEach((type) => {
            rows.push(
                `${category.displayName},${type.displayName},${type.count}`
            );
        });
    });

    const csv = rows.join('\n');
    downloadCSV(csv, filename);
};
