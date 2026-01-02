import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import {
    IneligibilityReason,
    NotAvailabilityReasonField,
} from '@deps/utils/quick-quotes-rules/types';

import { useQuickQuoteParams } from '../../params-context';
import styles from '../content.module.css';

type QuickQuoteNotAvailableReasonCellProps = {
    className?: string;
    reasons?: IneligibilityReason[];
};

export const QuickQuoteNotAvailableReasonCell = ({
    className,
    reasons,
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
            <ul className={styles.noBulletList}>
                <li>
                    <Typography
                        className={styles.notAvailableText}
                        variant={TypographyVariant.BodySm}
                    >
                        {t('clientCase.quickQuoteResults.notAvailable')}
                    </Typography>
                </li>
                {reasons?.map((reason) => {
                    return (
                        <li key={`${reason.field}`}>
                            <Typography
                                className={styles.notAvailableText}
                                variant={TypographyVariant.BodySm}
                            >
                                {reasonMessageMap[reason.field]}
                            </Typography>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
