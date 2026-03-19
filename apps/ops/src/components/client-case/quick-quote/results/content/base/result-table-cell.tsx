import { TypographyVariant } from '@deps/components/typography/typography';
import { DataItem, RiderDataItem } from '@deps/utils/quick-quotes-rules/types';

import { QuickQuoteIneligibilityReasonCell } from './not-available-reason-cell';
import { QuickQuoteRangeCell } from './range-cell';
import { QuickQuoteResultTableErrorCell } from './result-table-error-cell';

type QuickQuoteResultTableCellProps = {
    data: DataItem | RiderDataItem;
    variant?: TypographyVariant;
};

export const QuickQuoteResultTableCell = ({
    data,
    variant,
}: QuickQuoteResultTableCellProps) => {
    const { value, period, hasRiderErrors, ineligibilityReasons } = data;

    if ('fieldName' in data && data.hasApiError) {
        const { termLength, fieldName } = data;
        return (
            <QuickQuoteResultTableErrorCell {...{ termLength, fieldName }} />
        );
    }

    if (value == null) {
        return (
            <QuickQuoteIneligibilityReasonCell reasons={ineligibilityReasons} />
        );
    }

    return (
        <div>
            <QuickQuoteRangeCell
                value={value}
                period={period}
                variant={variant}
                hasRiderErrors={hasRiderErrors}
            />
            {ineligibilityReasons && (
                <QuickQuoteIneligibilityReasonCell
                    reasons={ineligibilityReasons}
                />
            )}
        </div>
    );
};
