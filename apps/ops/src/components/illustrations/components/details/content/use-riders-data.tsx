import { useTranslation } from 'next-i18next';
import { ReactNode } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import { OutputCoverageValues } from '@deps/queries/api/client/documents/v3/illustrations';

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
    type Keys<T> = T extends any ? keyof T : never;

    return (Object.keys(coverages) as Keys<typeof coverages>[])
        .filter((k) => k !== 'base')
        .map((riderName) => {
            const { premium } = (
                coverages as unknown as Record<
                    string,
                    OutputCoverageValues | undefined
                >
            )[riderName] ?? { premium: null };
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
