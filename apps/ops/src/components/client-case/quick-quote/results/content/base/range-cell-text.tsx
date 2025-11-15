import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { NumberOrRange } from '@deps/types/quickQuote';

import { buildRangeText } from '../../../helpers';
import styles from '../content.module.css';

type QuickQuoteRangeCellTextProps = {
    className?: string;
    value: NumberOrRange | undefined;
    period?: string;
    variant?: TypographyVariant;
    notAvailableText?: string;
};

export const QuickQuoteRangeCellText = ({
    className,
    value,
    period,
    notAvailableText,
    variant = TypographyVariant.BodySm,
}: QuickQuoteRangeCellTextProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});

    return (
        <Typography
            className={clsx(
                {
                    [styles.notAvailableText]: value == null,
                },
                className
            )}
            variant={value != null ? variant : TypographyVariant.BodySm}
        >
            {value != null
                ? buildRangeText(value, period)
                : notAvailableText ||
                  t('clientCase.quickQuoteResults.notAvailable')}
        </Typography>
    );
};
