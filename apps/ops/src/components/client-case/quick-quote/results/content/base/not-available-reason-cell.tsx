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
    RiderIneligibilityReason,
} from '@deps/utils/quick-quotes-rules/types';

import styles from '../content.module.css';

type QuickQuoteIneligibilityReasonCellProps = {
    className?: string;
    reasons?: IneligibilityReason[] | RiderIneligibilityReason[];
};

const IneligibleLabel = ({ termLength }: { termLength?: string }) => {
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

const IneligibilityReasonLabel = ({
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
                'clientCase.quickQuoteResults.ineligibilityReason.maxAge',
                {
                    age: maxAge,
                }
            );
        } else {
            message = t(
                'clientCase.quickQuoteResults.ineligibilityReason.minAge',
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
                'clientCase.quickQuoteResults.ineligibilityReason.maxFaceAm',
                {
                    amount: formatToCurrency(maxFaceAmount),
                }
            );
        } else {
            message = t(
                'clientCase.quickQuoteResults.ineligibilityReason.minFaceAm',
                {
                    amount: formatToCurrency(minFaceAmount),
                }
            );
        }
    } else if (reason.reason === 'stateNotEligible') {
        message = t('clientCase.quickQuoteResults.ineligibilityReason.state');
    } else if (reason.reason === 'underMinimumPolicyFaceAmount') {
        message = t(
            'clientCase.quickQuoteResults.ineligibilityReason.minimumPolicyFaceAmount',
            {
                amount: formatToCurrency(reason.expected),
            }
        );
    } else if (reason.reason === 'requiredRiderNotSelected') {
        message = t(
            'clientCase.quickQuoteResults.ineligibilityReason.requiredRiderNotSelected',
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
            'clientCase.quickQuoteResults.ineligibilityReason.riderFaceAmount'
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

export const QuickQuoteIneligibilityReasonCell = ({
    className,
    reasons,
}: QuickQuoteIneligibilityReasonCellProps) => {
    const isRiderReason = (
        reasons: IneligibilityReason[] | RiderIneligibilityReason[] | undefined
    ): reasons is RiderIneligibilityReason[] => {
        if (reasons === undefined) return false;

        const result =
            Array.isArray(reasons) &&
            reasons.every(
                (r) => Object.keys(r).findIndex((k) => k === 'termLengths') >= 0
            );

        return result;
    };

    return (
        <div className={clsx(styles.ineligibilityReasonCell, className)}>
            {!isRiderReason(reasons) ? (
                <div>
                    <IneligibleLabel />
                    <ul className={styles.reasonList}>
                        {reasons?.map((reason) => {
                            return (
                                <li key={`${reason.field}`}>
                                    <IneligibilityReasonLabel reason={reason} />
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
                            <IneligibleLabel
                                termLength={concatenatedTermLengths}
                            />
                            <ul className={styles.reasonList}>
                                {reasons &&
                                    reasons.map((reason) => (
                                        <li key={`${reason.field}`}>
                                            <IneligibilityReasonLabel
                                                reason={reason}
                                            />
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    );
                })
            ) : (
                <IneligibleLabel />
            )}
        </div>
    );
};
