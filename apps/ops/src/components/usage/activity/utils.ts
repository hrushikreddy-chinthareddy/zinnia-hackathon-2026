import dayjs from 'dayjs';
import Highcharts from 'highcharts';
import groupBy from 'lodash/groupBy';
import { TFunction } from 'next-i18next';

import { GroupedColumnSeries } from '@deps/components/dashboard/charts/bar-charts/grouped-column-chart/grouped-column-chart';
import { groupDataByWeek } from '@deps/components/dashboard/charts/date-time-chart/dateTimeChartUtils';
import {
    ActivityType,
    colors,
    downloadCSV,
    TRANSACTION_CATEGORY_DISPLAY_MAP,
    TRANSACTION_TYPE_DISPLAY_MAP,
} from '@deps/components/usage/utils';
import {
    UserIllustrationActivityOutputLevel1,
    UserIllustrationActivityOutputLevel3,
    UserTransactionOutputLevel1,
    UserTransactionOutputLevel3,
} from '@zinnia/api-types/types/analytics';

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

export const generateSeries = (
    activityData: UserIllustrationActivityOutputLevel1[] | undefined,
    timerange: { from: string; to: string },
    color: string[],
    t: TFunction
) => {
    if (!activityData?.length) return [];

    const fromDate = dayjs(timerange.from);
    const toDate = dayjs(timerange.to);
    const olderThanOneWeek = toDate.diff(fromDate, 'week') > 1;

    return activityData.map((item, index) => {
        const data = olderThanOneWeek
            ? groupDataByWeek(item.values!)
            : item.values;

        const timeData =
            data?.map((item: UserIllustrationActivityOutputLevel3) => [
                dayjs(item.name).unix() * 1000,
                item.count,
            ]) ?? [];

        const name = t(`allFields.${item.name?.toLowerCase()}`) ?? item.name;
        const firstDataPoint = data?.[0]?.name ?? 0;

        // Ensure months from filter (3M, 6M) are shown in chart even when there is no data on those dates
        const olderThanOneMonth =
            Math.abs(fromDate.diff(dayjs(firstDataPoint), 'month')) > 1;
        if (!olderThanOneMonth) {
            return {
                type: 'line',
                name,
                color: color[index],
                data: timeData,
            };
        }

        const defaultStartTime = fromDate.unix() * 1000;

        return {
            type: 'line',
            name,
            color: color[index],
            data: [[defaultStartTime, 0], ...timeData],
        };
    });
};

/**
 * Merge Duplicated and Created data into Created activity type
 * @param data UserIllustrationActivityOutputLevel1[]
 * @returns
 */
export const mergeDuplicatedIntoCreated = (
    data: UserIllustrationActivityOutputLevel1[]
): UserIllustrationActivityOutputLevel1[] => {
    const groups = groupBy(
        data,
        (item) => item.name.toLowerCase() ?? 'unknown'
    );

    const created = groups.created?.[0];
    const duplicated = groups.duplicated?.[0];

    if (!created || !duplicated) {
        return data;
    }

    const dateMap = new Map(
        created.values?.map((v) => [v.name, v.count]) ?? []
    );

    for (const v of duplicated.values ?? []) {
        const prev = dateMap.get(v.name) ?? 0;
        dateMap.set(v.name, prev + v.count);
    }

    const mergedValues = Array.from(dateMap, ([date, count]) => ({
        key: 'activityDay',
        name: date,
        count,
    })).toSorted((a, b) => a.name.localeCompare(b.name));

    const newCreated: UserIllustrationActivityOutputLevel1 = {
        ...created,
        count: mergedValues.reduce((acc, v) => acc + v.count, 0),
        values: mergedValues,
    };

    const others = Object.entries(groups)
        .filter(([type]) => type !== ActivityType.Duplicated.toLowerCase())
        .flatMap(([_, list]) => list)
        .filter(
            (item) =>
                item?.name.toLowerCase() !== ActivityType.Created.toLowerCase()
        )
        .map((item) => {
            const values = item?.values ?? [];
            const total = values.reduce((acc, v) => acc + (v.count ?? 0), 0);
            return {
                ...item,
                count: total,
            };
        }) as UserIllustrationActivityOutputLevel1[];

    return [newCreated, ...others];
};

export const formatIllustrationActivity = (
    data: UserIllustrationActivityOutputLevel1[]
) => {
    const dateMap = new Map();
    for (const activity of data) {
        const typeName = String(activity.name).toLowerCase();

        const isCreated = typeName === ActivityType.Created.toLowerCase();
        const isSelected = typeName === ActivityType.Selected.toLowerCase();

        if (!isCreated && !isSelected) continue;

        const values = activity?.values ?? [];

        for (const value of values) {
            const date = value?.name;
            if (!date) continue;

            const count = Number.isFinite(value?.count) ? value.count : 0;
            const existing = dateMap.get(date) ?? {
                date,
                created: 0,
                selected: 0,
            };

            if (isCreated) {
                existing.created += count;
            } else if (isSelected) {
                existing.selected += count;
            }

            dateMap.set(date, existing);
        }
    }

    return Array.from(dateMap.values()).sort((a, b) =>
        a.date.localeCompare(b.date)
    );
};

export const prepareIllustrationsActivityCSV = (
    data: UserIllustrationActivityOutputLevel1[],
    filename = 'Illustration-Activity.csv',
    t?: TFunction
) => {
    const rows: string[] = [
        `${t ? t('allFields.date') : 'Date'}, ${
            t ? t('allFields.productType') : 'Product Type'
        },${t ? t('allFields.created') : 'Created'},${
            t ? t('allFields.selected') : 'Selected'
        }`,
    ];
    const entries = formatIllustrationActivity(data);

    const typeIdx = filename.indexOf(' ');
    const productType = filename.substring(0, typeIdx);

    for (const entry of entries) {
        const [year, month, day] = entry.date.split('-');
        const formattedDate = `${parseInt(month)}/${parseInt(day)}/${year}`;
        rows.push(
            `${formattedDate},${productType},${entry.created},${entry.selected}`
        );
    }

    const csv = rows.join('\n');
    downloadCSV(csv, filename);
};
