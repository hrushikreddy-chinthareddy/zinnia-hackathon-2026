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

    const formatToCurrency = (value: number) =>
        numberFormatify(value, {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });

    let ageMessage = '';
    if (reason.field === 'age') {
        const maxAge = reason.expected[1];
        const minAge = reason.expected[0];
        if (reason.actual > maxAge) {
            ageMessage = t(
                'clientCase.quickQuoteResults.notAvailableReason.maxAge',
                {
                    age: maxAge,
                }
            );
        } else {
            ageMessage = t(
                'clientCase.quickQuoteResults.notAvailableReason.minAge',
                {
                    age: minAge,
                }
            );
        }
    }

    let faceAmountMessage = '';
    if (reason.field === 'face') {
        const maxFaceAmount = reason.expected[1];
        const minFaceAmount = reason.expected[0];
        if (reason.actual > maxFaceAmount) {
            faceAmountMessage = t(
                'clientCase.quickQuoteResults.notAvailableReason.maxFaceAm',
                {
                    amount: formatToCurrency(maxFaceAmount),
                }
            );
        } else {
            faceAmountMessage = t(
                'clientCase.quickQuoteResults.notAvailableReason.minFaceAm',
                {
                    amount: formatToCurrency(minFaceAmount),
                }
            );
        }
    }

    let adrMaxFaceMessage = '';
    if (reason.field === 'adrMaxFace') {
        adrMaxFaceMessage = t(
            'clientCase.quickQuoteResults.notAvailableReason.riderFaceAmount'
        );
    }

    const reasonMessageMap = {
        age: ageMessage,
        face: faceAmountMessage,
        adrMaxFace: adrMaxFaceMessage,
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
