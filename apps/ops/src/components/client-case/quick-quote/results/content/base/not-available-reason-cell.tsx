import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { NotAvailabilityReasonField } from '@deps/utils/quick-quotes-rules/types';

import { useQuickQuoteParams } from '../../params-context';
import styles from '../content.module.css';

type QuickQuoteNotAvailableReasonCellProps = {
    className?: string;
    reason?: string;
};

export const QuickQuoteNotAvailableReasonCell = ({
    className,
    reason,
}: QuickQuoteNotAvailableReasonCellProps) => {
    const { insuredAge } = useQuickQuoteParams();
    const { t } = useTranslation(TranslationFiles.COMMON, {});

    const reasonMessageMap = {
        age: t('clientCase.quickQuoteResults.notAvailableReason.age', {
            age: insuredAge,
        }),
        state: t('clientCase.quickQuoteResults.notAvailableReason.state'),
        face: t('clientCase.quickQuoteResults.notAvailableReason.state'),
        termLength: t('clientCase.quickQuoteResults.notAvailable'),
    } satisfies Record<
        NonNullable<NotAvailabilityReasonField>,
        string
    > as Record<string, string>;

    return (
        <div className={clsx(styles.notAvailableReasonCell, className)}>
            <Typography
                className={styles.notAvailableText}
                variant={TypographyVariant.BodySm}
            >
                {reasonMessageMap[reason as string] ??
                    t('clientCase.quickQuoteResults.notAvailable')}
            </Typography>
        </div>
    );
};
