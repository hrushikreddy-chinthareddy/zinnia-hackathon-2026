import { useTranslation } from 'next-i18next';
import { ReactNode } from 'react';
import { KeysOfUnion } from 'type-fest';

import { TranslationFiles } from '@deps/config/translations';
import { RiderOutputCoverageValues } from '@deps/queries/api/v3/illustrations/types';

import { formatIllustrationDetailYearlyCurrency } from './illustration-details-helpers';
import { useRidersLabelMap } from './use-riders-label-map';
import { useIllustrationDetail } from '../../../providers/IllustrationDetailProvider';

export const useIllustrationRidersData = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});

    const ridersLabelMap = useRidersLabelMap();
    const illustration = useIllustrationDetail();

    if (!illustration) {
        return [];
    }

    const { coverages } = illustration.response.assumed;

    if (Object.keys(coverages).length === 1) {
        return [];
    }

    return (Object.keys(coverages) as KeysOfUnion<typeof coverages>[])
        .filter((key) => key !== 'base')
        .map((riderName) => {
            const { premium, isIncludedInQuote } = (
                coverages as unknown as Record<
                    string,
                    RiderOutputCoverageValues | undefined
                >
            )[riderName] ?? { premium: null, isIncludedInQuote: false };

            return {
                riderName,
                premium,
                isIncludedInQuote,
            };
        })
        .filter(({ isIncludedInQuote }) => isIncludedInQuote)
        .map(({ riderName, premium }) => {
            return {
                label: ridersLabelMap?.[riderName] ?? riderName,
                format: () =>
                    formatIllustrationDetailYearlyCurrency(
                        t,
                        premium
                    ) as ReactNode,
                value: premium,
            };
        });
};
