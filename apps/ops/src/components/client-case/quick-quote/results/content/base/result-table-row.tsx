import { ReactNode } from 'react';

import { TypographyVariant } from '@deps/components/typography/typography';
import { DataItem, RiderDataItem } from '@deps/utils/quick-quotes-rules/types';

import styles from '../content.module.css';
import { QuickQuoteIneligibilityReasonCell } from './not-available-reason-cell';
import { QuickQuoteResultTableCell } from './result-table-cell';

type QuickQuoteResultTableRowProps = {
    rowHeader?: ReactNode;
    data?: DataItem[] | RiderDataItem[];
    children?: ReactNode;
    cellsVariant?: TypographyVariant;
};

export const QuickQuoteResultTableRow = ({
    rowHeader,
    data,
    children,
    cellsVariant,
}: QuickQuoteResultTableRowProps) => {
    const isAllDataUnavailable = data?.every(({ value }) => value === null);
    const hasNoApiErrors = data?.every(
        (datum) => 'hasApiError' in datum && datum.hasApiError === null
    );
    const inegilibilityReasons = data?.map(({ inegilibilityReasons }) => {
        return inegilibilityReasons;
    });
    const hasSameIneligibilityReason =
        isAllDataUnavailable &&
        hasNoApiErrors &&
        new Set(inegilibilityReasons).size === 1;

    const cells =
        data && isAllDataUnavailable && hasSameIneligibilityReason ? (
            <QuickQuoteIneligibilityReasonCell
                className={styles.fullDataCell}
                reasons={data[0]?.inegilibilityReasons}
            />
        ) : (
            data?.map((datum, idx) => (
                <QuickQuoteResultTableCell
                    key={idx}
                    data={datum}
                    variant={cellsVariant}
                />
            ))
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
