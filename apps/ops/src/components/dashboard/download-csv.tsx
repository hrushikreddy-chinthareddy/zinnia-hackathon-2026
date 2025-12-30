import { Icon, IconType, Link } from '@zinnia/bloom/components';
import { FC } from 'react';

import { FlattenedDashboardStatsElement } from './sections/issue-counts-by-status/tab-content/table/issue-counts-by-status-table';

export interface Columns<T = any> {
    label: string;
    key: keyof T;
}

interface DownloadCSVProps {
    sortedData: FlattenedDashboardStatsElement[];
    csvFileName: string;
    columns: Columns<FlattenedDashboardStatsElement>[];
}

export const downloadCSV = <T extends Record<string, any>>(
    data: T[],
    filename: string = 'data.csv',
    columns: Columns<T>[]
): void => {
    if (!data.length) return;

    const headers = columns.map((col) => col.label);
    const rows = data.map((item) =>
        columns
            .map((col) => String(item[col.key] ?? ''))
            .map((value) => `"${value.replace(/"/g, '""')}"`)
            .join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const DownloadCSV: FC<DownloadCSVProps> = ({
    sortedData,
    csvFileName,
    columns,
}) => {
    return (
        <div
            className="flex items-center gap-2"
            onClick={() => downloadCSV(sortedData, `${csvFileName}`, columns)}
        >
            <Icon type={IconType.DOWNLOAD} />
            <Link href={'#'} text={'Export to CSV'} />
        </div>
    );
};
