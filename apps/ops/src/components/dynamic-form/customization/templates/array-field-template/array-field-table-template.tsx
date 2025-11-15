import { ArrayFieldTemplateProps, getUiOptions } from '@rjsf/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@zinnia/bloom/components';
import { useEffect, useState } from 'react';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { ZAHARA_DATE_FORMAT } from '@deps/helpers/date.helpers';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import {
    isNullEmptyOrUndefined,
    parseAndFormatDate,
} from '@deps/helpers/string.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

export enum PropertyKey {
    TransactionAmount = 'transactionAmount',
    CheckAmount = 'checkAmount',
    TransactionDate = 'transactionDate',
}

export function ArrayFieldTableTemplate(props: ArrayFieldTemplateProps) {
    const { items, schema, formData, uiSchema, title } = props;
    const [columns, setColumns] = useState<{ [key: string]: string }>({});
    const [sortedData, setSortedData] = useState<any[]>([]);
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<
        'ascending' | 'descending'
    >('ascending');
    const uiOptions = getUiOptions(uiSchema);
    const sorting = uiOptions.sorting as boolean | undefined;
    const tableTitle = uiOptions.title || title;

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
        setSortedData(formData || []);
    }, [items, uiSchema, formData]);

    useEffect(() => {
        if (!sortColumn || !sorting) {
            setSortedData(formData || []);
            return;
        }

        const sorted = [...(formData || [])];
        sorted.sort((a, b) => {
            const aValue = a[sortColumn] ?? '';
            const bValue = b[sortColumn] ?? '';
            if (aValue < bValue) return sortDirection === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'ascending' ? 1 : -1;
            return 0;
        });

        setSortedData(sorted);
    }, [formData, sortColumn, sortDirection, sorting]);

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
                <>
                    {tableTitle && (
                        <Typography
                            variant={TypographyVariant.BodyBold}
                            className="mb-2"
                        >
                            {tableTitle as string}
                        </Typography>
                    )}
                    <Table>
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
                                                      sortDirection ===
                                                      'ascending'
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
                                    {Object.keys(columns).map((property) => (
                                        <TableCell
                                            key={property}
                                            className="typography-content-body-sm"
                                        >
                                            {(property ===
                                                PropertyKey.TransactionAmount ||
                                                property ===
                                                    PropertyKey.CheckAmount) &&
                                            element[property] != null
                                                ? numberFormatify(
                                                      Math.abs(
                                                          element[property]
                                                      )
                                                  )
                                                : property ===
                                                      PropertyKey.TransactionDate &&
                                                  element[property] != null
                                                ? parseAndFormatDate(
                                                      ZAHARA_DATE_FORMAT,
                                                      'MM-DD-YYYY',
                                                      element[property]
                                                  )
                                                : !isNullEmptyOrUndefined(
                                                      element[property]
                                                  )
                                                ? element[property]
                                                : DEFAULT_ERROR_STRING}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </>
            )}
        </>
    );
}

export default ArrayFieldTableTemplate;
