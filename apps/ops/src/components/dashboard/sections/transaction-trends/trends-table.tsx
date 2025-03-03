import { Skeleton } from '@radix-ui/themes';
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow, TableStickyColumn } from '@zinnia/bloom/components';
import { toTitleCase } from '@zinnia/utils';
import clsx from 'clsx';
import { FC } from 'react';

import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import { TimeframeFilterOptions } from '@deps/containers/dashboard/closed-transactions/closed-transactions';
import { LineAndVolumeCategoryAndSeries } from '@deps/helpers/dashboard/line-and-volume-category-chart.helper';
import { wholeNumberFormatify } from '@deps/helpers/numbers.helper';

interface TrendsTableProps {
    data: LineAndVolumeCategoryAndSeries;
    timeframe: TimeframeFilterOptions;
    legendLabel: string;
    colors: string[];
    linkQueryFormat: string;
}

export const TransactionTrendsTable: FC<TrendsTableProps> = ({ data, timeframe, legendLabel, colors, linkQueryFormat }) => {
    const monthlyArray = [...Object.values(data.monthlyByLevel1Grouping)];

    const tableHeaders = {
        name: legendLabel,
        avg: 'Monthly Avg',
        total: 'Total Cases',
    };

    return (
        <Table stickyColumn={TableStickyColumn.End}>
            <TableHeader>
                <TableRow>
                    {Object.entries(tableHeaders).map(([key, value], index) => {
                        return (
                            <TableHeaderCell className={clsx('typography-content-body-sm-bold', index !== 0 && '!text-right')} key={key}>
                                <span className="inline-flex items-center align-middle gap-1">{value}</span>
                            </TableHeaderCell>
                        );
                    })}
                </TableRow>
            </TableHeader>
            <TableBody>
                {Array.from({ length: 5 }).map((_, index) => {
                    const divisors: Record<TimeframeFilterOptions, number> = {
                        [TimeframeFilterOptions.Trailing12Months]: 12,
                        [TimeframeFilterOptions.Last6Months]: 6,
                        [TimeframeFilterOptions.Last90Days]: 3,
                        [TimeframeFilterOptions.Last60Days]: 2,
                        [TimeframeFilterOptions.LastMonth]: 1,
                    };

                    const stat = monthlyArray[index];
                    const NoDataComponent = !data ? Skeleton : 'div';
                    const NoDataCell = <NoDataComponent className={clsx('grow h-[22px] w-full rounded', !data && 'bg-gray-50')} />;

                    if (!stat) {
                        return null;
                    }

                    return (
                        <TableRow key={`stat-${index}-${stat?.name || ''}`}>
                            <TableCell className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded" style={{ backgroundColor: colors[index] }}></div>
                                {stat?.name ? (
                                    <NavElement
                                        href={linkQueryFormat.replace(/replaceme/g, encodeURIComponent(stat.name))}
                                        size={NavElementSize.Small}
                                        type={NavElementType.Link}
                                        className="capitalize whitespace-nowrap overflow-hidden text-ellipsis typography-content-body-sm-bold"
                                        target="_blank"
                                        title={toTitleCase(stat.name)}
                                    >
                                        {stat.name}
                                    </NavElement>
                                ) : (
                                    NoDataCell
                                )}
                            </TableCell>
                            <TableCell className={`typography-content-body-sm text-right`}>
                                {stat?.total
                                    ? wholeNumberFormatify(stat.total / divisors[timeframe || TimeframeFilterOptions.Trailing12Months])
                                    : NoDataCell}
                            </TableCell>
                            <TableCell className={`typography-content-body-sm text-right`}>
                                {stat?.total ? wholeNumberFormatify(stat.total) : NoDataCell}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
};
