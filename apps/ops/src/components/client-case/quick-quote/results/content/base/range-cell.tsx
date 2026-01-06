import clsx from 'clsx';

import {
    TypographyProps,
    TypographyVariant,
} from '@deps/components/typography/typography';
import { NumberOrRange } from '@deps/types/quickQuote';

import styles from '../content.module.css';
import { QuickQuoteRangeCellText } from './range-cell-text';

type QuickQuoteRangeCellProps = {
    value: NumberOrRange | undefined;
    period?: string;
    variant?: TypographyVariant;
    hasRiderErrors?: boolean;
} & Omit<TypographyProps, 'children' | 'variant'>;

export const QuickQuoteRangeCell = ({
    className,
    value,
    period,
    hasRiderErrors,
    variant = TypographyVariant.BodySm,
    ...rest
}: QuickQuoteRangeCellProps) => (
    <div className={clsx(styles.contentDataCell, className)} {...rest}>
        <QuickQuoteRangeCellText
            {...{ value, period, variant, hasRiderErrors }}
        />
    </div>
);
