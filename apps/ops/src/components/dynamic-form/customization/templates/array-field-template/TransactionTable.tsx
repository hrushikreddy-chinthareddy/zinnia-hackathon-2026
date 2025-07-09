import { getUiOptions, RJSFSchema } from '@rjsf/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@zinnia/bloom/components';
import { useEffect, useState } from 'react';

import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { parseAndFormatDate } from '@deps/helpers/string.helpers';

import { Transaction } from './TransactionsArrayFieldTemplate';

export const TransactionsTable = ({
    schema,
    items,
    uiSchema,
    sorting,
    TransactionData,
}: {
    schema: RJSFSchema;
    items: any;
    uiSchema: any;
    sorting: boolean | undefined;
    TransactionData: Transaction[];
}) => {
    const [columns, setColumns] = useState<{ [key: string]: string }>({});

    const [sortedData, setSortedData] = useState<any[]>([]);
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<
        'ascending' | 'descending'
    >('ascending');

    useEffect(() => {
        const cols: { [key: string]: string } = {};
        if (items.length > 0) {
            const properties = items[0].schema.properties;
            for (const property in properties) {
                if (
                    getUiOptions(uiSchema?.items?.[property] || {}).widget !==
                    'hidden'
                ) {
                    cols[property] =
                        (properties[property] as any).title || property;
                }
            }
        }
        setColumns(cols);
        setSortedData(TransactionData as any[]);
    }, [items, uiSchema, TransactionData]);

    useEffect(() => {
        if (!sortColumn || !sorting) {
            setSortedData(TransactionData as any[]);
            return;
        }

        const sorted = [...(TransactionData as any[])];
        sorted.sort((a, b) => {
            const aValue = a[sortColumn] ?? '';
            const bValue = b[sortColumn] ?? '';
            if (aValue < bValue) return sortDirection === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'ascending' ? 1 : -1;
            return 0;
        });

        setSortedData(sorted);
    }, [TransactionData, sortColumn, sortDirection, sorting]);

    const handleSort = (property: string) => {
        if (!sorting) return;

        if (sortColumn === property) {
            setSortDirection(
                sortDirection === 'ascending' ? 'descending' : 'ascending'
            );
        } else {
            setSortColumn(property);
            setSortDirection('ascending');
        }
    };

    return (
        <>
            {schema.type === 'array' && (
                <Table className="mt-2">
                    <TableHeader>
                        <TableRow>
                            {Object.entries(columns).map(
                                ([property, title], index) => (
                                    <TableHeaderCell
                                        key={property}
                                        className="typography-content-body-sm-bold"
                                        sortable={sorting}
                                        onClick={() => handleSort(property)}
                                    >
                                        {sorting && sortColumn === property
                                            ? `${title} ${
                                                  sortDirection === 'ascending'
                                                      ? '↑'
                                                      : '↓'
                                              }`
                                            : title}
                                    </TableHeaderCell>
                                )
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedData.map((element: any, index: number) => (
                            <TableRow key={element.key ?? index}>
                                {Object.keys(columns).map((property) => {
                                    return (
                                        <TableCell
                                            key={property}
                                            className="typography-content-body-sm"
                                        >
                                            {property === 'transactionAmount' &&
                                            element[property] != null
                                                ? numberFormatify(
                                                      Math.abs(
                                                          element[property]
                                                      )
                                                  )
                                                : property ===
                                                      'checkIssueDate' &&
                                                  element[property] != null
                                                ? parseAndFormatDate(
                                                      'YYYY-MM-DD',
                                                      'MM-DD-YYYY',
                                                      element[property]
                                                  )
                                                : element[property] != null
                                                ? element[property]
                                                : ''}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </>
    );
};
