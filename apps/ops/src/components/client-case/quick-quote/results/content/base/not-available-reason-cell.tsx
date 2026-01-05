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
    reasons?:
        | IneligibilityReason[]
        | Partial<Record<number, IneligibilityReason[]>>;
};

const NotAvailableLabel = ({ termLength }: { termLength?: string }) => {
    const { t } = useTranslation();

    return (
        <Typography
            className={styles.notAvailableText}
            variant={TypographyVariant.BodySm}
        >
            <b>
                {!termLength
                    ? t('clientCase.quickQuoteResults.notAvailable')
                    : t(
                          'clientCase.quickQuoteResults.notAvailableByTermLength',
                          {
                              termLength: termLength,
                          }
                      )}
            </b>
        </Typography>
    );
};

const NotAvailabilityReasonLabel = ({
    reason,
}: {
    reason: IneligibilityReason;
}) => {
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
        <Typography
            className={styles.notAvailableText}
            variant={TypographyVariant.BodySm}
        >
            {reasonMessageMap[reason.field]}
        </Typography>
    );
};

export const QuickQuoteNotAvailableReasonCell = ({
    className,
    reasons,
}: QuickQuoteNotAvailableReasonCellProps) => {
    return (
        <div className={clsx(styles.notAvailableReasonCell, className)}>
            {Array.isArray(reasons) ? (
                <>
                    <NotAvailableLabel />
                    <ul className={styles.reasonList}>
                        {reasons?.map((reason) => {
                            return (
                                <li key={`${reason.field}`}>
                                    <NotAvailabilityReasonLabel
                                        reason={reason}
                                    />
                                </li>
                            );
                        })}
                    </ul>
                </>
            ) : typeof reasons === 'object' ? (
                // TODO: Is it possible that a rider is not available  by itself?
                Object.entries(reasons).map(([termLength, reasons]) => {
                    return (
                        <div key={`${termLength}`}>
                            <NotAvailableLabel termLength={termLength} />
                            <ul className={styles.reasonList}>
                                {reasons &&
                                    reasons.map((reason) => (
                                        <li key={`${reason.field}`}>
                                            <NotAvailabilityReasonLabel
                                                reason={reason}
                                            />
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    );
                })
            ) : (
                <NotAvailableLabel />
            )}
        </div>
    );
};
