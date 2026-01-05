import { ReactNode } from 'react';

import { TypographyVariant } from '@deps/components/typography/typography';
import { DataItem, RiderDataItem } from '@deps/utils/quick-quotes-rules/types';

import { QuickQuoteRangeCell } from './range-cell';
import styles from '../content.module.css';
import { QuickQuoteNotAvailableReasonCell } from './not-available-reason-cell';

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
    const isAllDataUnAvailable = data?.every(({ value }) => value == null);
    const notAvailabilityReasons = data?.map(({ notAvailabilityReasons }) => {
        return notAvailabilityReasons;
    });
    const hasSameNotAvailabilityReason =
        isAllDataUnAvailable && new Set(notAvailabilityReasons).size === 1;

    const cells =
        data == null ? null : isAllDataUnAvailable &&
          hasSameNotAvailabilityReason ? (
            <QuickQuoteNotAvailableReasonCell
                className={styles.fullDataCell}
                reasons={data[0]?.notAvailabilityReasons}
            />
        ) : (
            data?.map(({ value, period, notAvailabilityReasons }, idx) =>
                value != null ? (
                    <div key={idx}>
                        <QuickQuoteRangeCell
                            value={value}
                            period={period}
                            variant={cellsVariant}
                        />
                        {notAvailabilityReasons && (
                            <QuickQuoteNotAvailableReasonCell
                                key={idx}
                                reasons={notAvailabilityReasons}
                            />
                        )}
                    </div>
                ) : (
                    <QuickQuoteNotAvailableReasonCell
                        key={idx}
                        reasons={notAvailabilityReasons}
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
