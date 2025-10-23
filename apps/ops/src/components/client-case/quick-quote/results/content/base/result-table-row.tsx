import { ReactNode } from 'react';

import { TypographyVariant } from '@deps/components/typography/typography';

import { QuickQuoteRangeCell } from './range-cell';
import { NumberOrRange } from '../../../types';
import styles from '../content.module.css';

type DataItem = {
    period?: string;
    value: NumberOrRange | undefined;
};

type QuickQuoteResultTableRowProps = {
    rowHeader?: ReactNode;
    data?: DataItem[];
    children?: ReactNode;
    cellsVariant?: TypographyVariant;
};

export const QuickQuoteResultTableRow = ({
    rowHeader,
    data,
    children,
    cellsVariant,
}: QuickQuoteResultTableRowProps) => {
    return (
        <div role="row" className={styles.contentTableRow}>
            <div className={styles.contentTableRowHeader} role="rowheader">
                {rowHeader}
            </div>
            {data?.map(({ value, period }) => (
                <QuickQuoteRangeCell
                    key={Array.isArray(value) ? value.join('-') : value}
                    value={value}
                    period={period}
                    variant={cellsVariant}
                />
            ))}
            {children}
        </div>
    );
};
