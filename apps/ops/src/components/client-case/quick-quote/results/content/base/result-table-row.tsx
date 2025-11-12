import clsx from 'clsx';
import { ReactNode } from 'react';

import { TypographyVariant } from '@deps/components/typography/typography';
import { NumberOrRange } from '@deps/types/quickQuote';

import { QuickQuoteRangeCell } from './range-cell';
import styles from '../content.module.css';
import { QuickQuoteNotAvailableReasonCell } from './not-available-reason-cell';

type DataItem = {
    period?: string;
    value: NumberOrRange | undefined;
    notAvailabilityReason?: string;
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
    const isAllDataUnAvailable = data?.every(({ value }) => value == null);
    const notAvailabilityReasons = data?.map(
        ({ notAvailabilityReason }) => notAvailabilityReason
    );
    const hasSameNotAvailabilityReason =
        isAllDataUnAvailable && new Set(notAvailabilityReasons).size === 1;

    const cells =
        data == null ? null : isAllDataUnAvailable &&
          hasSameNotAvailabilityReason ? (
            <QuickQuoteNotAvailableReasonCell
                className={styles.fullDataCell}
                reason={data[0].notAvailabilityReason}
            />
        ) : (
            data?.map(({ value, period, notAvailabilityReason }, idx) =>
                value != null ? (
                    <QuickQuoteRangeCell
                        key={idx}
                        value={value}
                        period={period}
                        variant={cellsVariant}
                    />
                ) : (
                    <QuickQuoteNotAvailableReasonCell
                        key={idx}
                        reason={notAvailabilityReason}
                    />
                )
            )
        );
    return (
        <div role="row" className={styles.contentTableRow}>
            <div className={styles.contentTableRowHeader} role="rowheader">
                {rowHeader}
            </div>
            {cells}
            {children}
        </div>
    );
};
