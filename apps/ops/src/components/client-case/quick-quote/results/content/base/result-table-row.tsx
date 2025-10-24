import { ReactNode } from 'react';

import { TypographyVariant } from '@deps/components/typography/typography';
import { NumberOrRange } from '@deps/types/quickQuote';

import { QuickQuoteRangeCell } from './range-cell';
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
}: QuickQuoteResultTableRowProps) => (
    <div role="row" className={styles.contentTableRow}>
        <div className={styles.contentTableRowHeader} role="rowheader">
            {rowHeader}
        </div>
        {data?.map(({ value, period }, idx) => (
            <QuickQuoteRangeCell
                key={idx}
                value={value}
                period={period}
                variant={cellsVariant}
            />
        ))}
        {children}
    </div>
);
