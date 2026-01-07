import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import {
    IneligibilityReason,
    NotAvailabilityReasonField,
} from '@deps/utils/quick-quotes-rules/types';

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
    const { t } = useTranslation(TranslationFiles.COMMON, {});

    let ageMessage = '';
    if (reason.field === 'age') {
        if (reason.actual > reason.expected[1]) {
            ageMessage = t(
                'clientCase.quickQuoteResults.notAvailableReason.maxAge',
                {
                    age: reason.expected[1],
                }
            );
        } else {
            ageMessage = t(
                'clientCase.quickQuoteResults.notAvailableReason.minAge',
                {
                    age: reason.expected[0],
                }
            );
        }
    }

    let faceAmountMessage = '';
    if (reason.field === 'face') {
        if (reason.actual > reason.expected[1]) {
            faceAmountMessage = t(
                'clientCase.quickQuoteResults.notAvailableReason.maxFaceAm',
                {
                    amount: numberFormatify(reason.expected[1], {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                    }),
                }
            );
        } else {
            faceAmountMessage = t(
                'clientCase.quickQuoteResults.notAvailableReason.minFaceAm',
                {
                    amount: numberFormatify(reason.expected[0], {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                    }),
                }
            );
        }
    }

    const reasonMessageMap = {
        age: ageMessage,
        face: faceAmountMessage,
        state: t('clientCase.quickQuoteResults.notAvailableReason.state'),
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
                <div>
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
                </div>
            ) : typeof reasons === 'object' ? (
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
