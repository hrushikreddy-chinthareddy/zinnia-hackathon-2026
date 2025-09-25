import {
    UserViewsOutputLevel1,
    UserViewsOutputLevel3,
} from '@xd/api-types/dist/generated-types/analytics';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

import { groupDataByWeek } from '@deps/components/dashboard/charts/date-time-chart/dateTimeChartUtils';
import { ZAHARA_DATE_FORMAT } from '@deps/helpers/date.helpers';

import {
    downloadCSV,
    UiRoles,
    UI_ROLE_ORDER,
    ROLE_OPTIONS,
    toUiRole,
} from '../utils';

export enum TimeframeFilterOptions {
    Last6Months = '6M',
    Last3Months = '3M',
    Last1Month = '1M',
}

export const startDates: Record<TimeframeFilterOptions, string> = {
    [TimeframeFilterOptions.Last6Months]: dayjs()
        .subtract(6, 'month')
        .format(ZAHARA_DATE_FORMAT),
    [TimeframeFilterOptions.Last3Months]: dayjs()
        .subtract(3, 'month')
        .format(ZAHARA_DATE_FORMAT),
    [TimeframeFilterOptions.Last1Month]: dayjs()
        .subtract(1, 'month')
        .format(ZAHARA_DATE_FORMAT),
};

dayjs.extend(isoWeek);

export const roles = ROLE_OPTIONS;

type Row = { process: string; role: string; count: number };

export const categoryValueTooltip: Highcharts.TooltipFormatterCallbackFunction =
    function (this) {
        const category = String(this.x ?? '');
        const seriesName = this.series?.name ?? '';
        const yVal =
            typeof this.y === 'number'
                ? this.y.toString()
                : String(this.y ?? '');

        return `<b>${category}</b><br/>${seriesName}: <b>${yVal}</b>`;
    };

export function toProcessRoleRows(rawData: any[] | undefined): Row[] {
    if (!rawData?.length) return [];
    const rows: Row[] = [];

    for (const p of rawData) {
        const process = p.name ?? 'Unknown';
        const roleBuckets: any[] = Array.isArray(p.values) ? p.values : [];
        for (const rb of roleBuckets) {
            if (rb.key !== 'userRole') continue;
            const role = rb.name ?? 'Unknown';
            let total = 0;
            if (Array.isArray(rb.values) && rb.values.length) {
                for (const d of rb.values) total += Number(d.count ?? 0);
            } else {
                total = Number(rb.count ?? 0);
            }
            rows.push({ process, role, count: total });
        }
    }
    return rows;
}

export function top5ProcessesByVisibleRoles(rows: Row[]): string[] {
    const totals = new Map<string, number>();

    for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const uiRole = toUiRole(r.role);
        if (!uiRole) continue;
        totals.set(r.process, (totals.get(r.process) ?? 0) + r.count);
    }
    const arr = Array.from(totals.entries());
    arr.sort((a, b) => b[1] - a[1]); // descending
    const top5 = arr.slice(0, 5).map(([name]) => name);
    return top5;
}

export function toGroupedBarSeriesFromRows(
    rows: Row[],
    categories: string[],
    colors: string[]
) {
    const pos: Record<string, number> = {};
    categories.forEach((c, i) => (pos[c] = i));

    const byRole = new Map<UiRoles, number[]>();
    for (const r of UI_ROLE_ORDER)
        byRole.set(r, Array(categories.length).fill(0));

    for (const r of rows) {
        const uiRole = toUiRole(r.role);
        if (!uiRole) continue;
        const i = pos[r.process];
        if (i != null) byRole.get(uiRole)![i] += r.count;
    }

    return UI_ROLE_ORDER.map((name, idx) => ({
        name,
        data: byRole.get(name)!,
        color: colors[idx],
    }));
}

export const generateSeries = (
    loginsData: UserViewsOutputLevel1[] | undefined,
    timerange: { from: string; to: string },
    color: string[]
) => {
    if (!loginsData?.length) return [];

    const fromDate = dayjs(timerange.from);
    const toDate = dayjs(timerange.to);
    const olderThanOneWeek = toDate.diff(fromDate, 'week') > 1;

    return loginsData.map((item, index) => {
        const data = olderThanOneWeek
            ? groupDataByWeek(item.values!)
            : item.values;
        return {
            type: 'line',
            name: item.name,
            color: color[index],
            data: data?.map((item: UserViewsOutputLevel3) => [
                dayjs(item.name).unix() * 1000,
                item.count,
            ]),
        };
    });
};

export const PrepareUserViewsCSV = (
    data: UserViewsOutputLevel1[],
    filename = 'Usage-Page-Views.csv'
) => {
    const rows: string[] = ['Date, Page Type, Total views'];

    for (const pageTypeEntry of data) {
        const pageType = pageTypeEntry.name;

        if (!Array.isArray(pageTypeEntry.values)) continue;

        for (const activity of pageTypeEntry.values) {
            const [year, month, day] = activity.name.split('-');
            const formattedDate = `${parseInt(month)}/${parseInt(day)}/${year}`;
            rows.push(`${formattedDate},${pageType},${activity.count}`);
        }
    }

    const csv = rows.join('\n');
    downloadCSV(csv, filename);
};

// Build a 0-filled role bucket in the same order as ROLE_UI_ORDER
const makeZeroRoleRow = (): Record<UiRoles, number> => {
    const o = {} as Record<UiRoles, number>;
    for (const r of UI_ROLE_ORDER) o[r] = 0;
    return o;
};

export const PrepareTop5CaseViewsCSV = (
    raw: UserViewsOutputLevel1[],
    filename = 'Zinnia-Live-Top-5-Case-Views.csv'
) => {
    const flatRows = toProcessRoleRows(raw);
    const categories = top5ProcessesByVisibleRoles(flatRows);

    const byProcess = new Map<string, Record<UiRoles, number>>(
        categories.map((p) => [p, makeZeroRoleRow()])
    );

    for (const { process, role, count } of flatRows) {
        const uiRole = toUiRole(role);
        if (!uiRole) continue;

        const bucket = byProcess.get(process); // undefined if not Top-5
        if (!bucket) continue;
        bucket[uiRole] += count;
    }
    const header = ['Case type', ...UI_ROLE_ORDER, 'Total'];
    const lines: string[] = [header.join(',')];

    for (const process of categories) {
        const r = byProcess.get(process) ?? makeZeroRoleRow();
        const roleValues = UI_ROLE_ORDER.map((role) => r[role] ?? 0);
        const total = roleValues.reduce((a, b) => a + b, 0);

        lines.push([process, ...roleValues, total].join(','));
    }

    downloadCSV(lines.join('\n'), filename);
};
