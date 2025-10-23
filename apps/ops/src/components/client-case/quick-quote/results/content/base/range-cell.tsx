import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import Typography, {
    TypographyProps,
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { NumberOrRange } from '@deps/types/quickQuote';

import { buildRangeText } from '../../../helpers';
import styles from '../content.module.css';

type QuickQuoteRangeCellProps = {
    value: NumberOrRange | undefined;
    period?: string;
    variant?: TypographyVariant;
} & Omit<TypographyProps, 'children' | 'variant'>;

export const QuickQuoteRangeCell = ({
    className,
    value,
    period,
    variant = TypographyVariant.BodySm,
    ...rest
}: QuickQuoteRangeCellProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});

    return (
        <div className={clsx(styles.contentDataCell, className)} {...rest}>
            <Typography
                className={clsx({
                    [styles.notAvailableText]: value == null,
                })}
                variant={value != null ? variant : TypographyVariant.BodySm}
            >
                {value != null
                    ? buildRangeText(value, period)
                    : t('clientCase.quickQuoteResults.notAvailable')}
            </Typography>
        </div>
    );
};
