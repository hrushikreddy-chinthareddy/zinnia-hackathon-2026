import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { getRiderNameFromRiderCode } from '@deps/types/quickQuote';
import {
    IneligibilityReason,
    RiderInegilibilityReason,
} from '@deps/utils/quick-quotes-rules/types';

import styles from '../content.module.css';

type QuickQuoteNotAvailableReasonCellProps = {
    className?: string;
    reasons?: IneligibilityReason[] | RiderInegilibilityReason[];
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
                          `clientCase.quickQuoteResults.${
                              termLength.length === 0
                                  ? 'notAvailableByTermLength'
                                  : 'notAvailableByTermLengths'
                          }`,
                          {
                              termLength: termLength,
                          }
                      )}
            </b>
        </Typography>
    );
};

const formatToCurrency = (value: number) =>
    numberFormatify(value, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

const NotAvailabilityReasonLabel = ({
    reason,
}: {
    reason: IneligibilityReason;
}) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});

    let message = '';
    if (reason.reason === 'ageOutsideOfRange') {
        const maxAge = reason.expected[1];
        const minAge = reason.expected[0];
        if (reason.actual > maxAge) {
            message = t(
                'clientCase.quickQuoteResults.notAvailableReason.maxAge',
                {
                    age: maxAge,
                }
            );
        } else {
            message = t(
                'clientCase.quickQuoteResults.notAvailableReason.minAge',
                {
                    age: minAge,
                }
            );
        }
    } else if (reason.reason === 'faceAmountOutsideOfRange') {
        const maxFaceAmount = reason.expected[1];
        const minFaceAmount = reason.expected[0];
        if (reason.actual > maxFaceAmount) {
            message = t(
                'clientCase.quickQuoteResults.notAvailableReason.maxFaceAm',
                {
                    amount: formatToCurrency(maxFaceAmount),
                }
            );
        } else {
            message = t(
                'clientCase.quickQuoteResults.notAvailableReason.minFaceAm',
                {
                    amount: formatToCurrency(minFaceAmount),
                }
            );
        }
    } else if (reason.reason === 'stateNotEligible') {
        message = t('clientCase.quickQuoteResults.notAvailableReason.state');
    } else if (reason.reason === 'underMinimumPolicyFaceAmount') {
        message = t(
            'clientCase.quickQuoteResults.notAvailableReason.minimumPolicyFaceAmount',
            {
                amount: formatToCurrency(reason.expected),
            }
        );
    } else if (reason.reason === 'requiredRiderNotSelected') {
        message = t(
            'clientCase.quickQuoteResults.notAvailableReason.requiredRiderNotSelected',
            {
                riders: reason.notSelectedRider
                    .map((e) =>
                        t(
                            `clientCase.illustrationDetails.riders.${getRiderNameFromRiderCode(
                                e
                            )}`
                        )
                    )
                    .join(','),
            }
        );
    } else if (reason.reason === 'riderIsGreaterThanPolicyFaceAmount') {
        message = t(
            'clientCase.quickQuoteResults.notAvailableReason.riderFaceAmount'
        );
    }

    return (
        <Typography
            className={styles.notAvailableText}
            variant={TypographyVariant.BodySm}
        >
            {message}
        </Typography>
    );
};

export const QuickQuoteNotAvailableReasonCell = ({
    className,
    reasons,
}: QuickQuoteNotAvailableReasonCellProps) => {
    const isRiderReason = (
        reasons: IneligibilityReason[] | RiderInegilibilityReason[] | undefined
    ): reasons is RiderInegilibilityReason[] => {
        if (reasons === undefined) return false;

        const result =
            Array.isArray(reasons) &&
            reasons.every(
                (r) => Object.keys(r).findIndex((k) => k === 'termLengths') >= 0
            );

        return result;
    };

    return (
        <div className={clsx(styles.notAvailableReasonCell, className)}>
            {!isRiderReason(reasons) ? (
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
            ) : isRiderReason(reasons) ? (
                reasons.map(({ termLengths, reasons }, idx) => {
                    const concatenatedTermLengths = termLengths?.join(', ');
                    return (
                        <div key={`${idx}`}>
                            <NotAvailableLabel
                                termLength={concatenatedTermLengths}
                            />
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
