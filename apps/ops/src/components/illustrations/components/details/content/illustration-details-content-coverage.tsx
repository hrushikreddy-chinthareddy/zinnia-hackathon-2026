import { useTranslation } from 'next-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { OutputCoverageValues } from '@deps/queries/api/client/documents/v3/illustrations';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { ProductTypes } from '@deps/types/product';

import ContentEntry from './illustration-details-content-entry';
import ContentSection from './illustration-details-content-section';
import { formatIllustrationDetailYearlyCurrency } from './illustration-details-helpers';
import { useRidersLabelMap } from './use-riders-label-map';
import { useIllustrationDetail } from '../../../providers/IllustrationDetailProvider';

export function useIllustrationCoverageData() {
    const ridersLabelMap = useRidersLabelMap();
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const illustration = useIllustrationDetail();
    const baseCoverageLabel = t(
        `clientCase.illustrationDetails.coverage.faceAmount`
    );

    if (!illustration) {
        return [
            {
                label: baseCoverageLabel,
                value: DEFAULT_ERROR_STRING,
            },
        ];
    }

    const { coverages } = illustration.response.assumed;

    if (illustration.productType === ProductTypes.TERM) {
        return [
            {
                label: baseCoverageLabel,
                value: numberFormatify(coverages.base.faceAmount),
            },
        ];
    }
    return [
        {
            label: baseCoverageLabel,
            value: numberFormatify(coverages.base.faceAmount),
        },
        // TODO: Add term length
        ...Object.keys(coverages)
            .filter((k) => k !== 'base')
            .map((riderName) => {
                const faceAmount = (
                    coverages as unknown as Record<string, OutputCoverageValues>
                )[riderName]?.faceAmount;
                return {
                    label: ridersLabelMap?.[riderName] ?? riderName,
                    value: numberFormatify(faceAmount),
                };
            }),
    ];
}

export default function TermContentCoverage() {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const illustration = useIllustrationDetail();

    const faceAmount =
        illustration?.response?.assumed?.coverages?.base?.faceAmount ?? null;
    const faceAmountStr = numberFormatify(faceAmount);
    const planYears =
        illustration?.inputs?.options?.fixedCostPeriod || DEFAULT_ERROR_STRING;

    return (
        <ContentSection
            className="min-h-28"
            title={t('clientCase.illustrationDetails.coverage.title')}
        >
            <dl className="contents">
                <ContentEntry
                    label={t(
                        `clientCase.illustrationDetails.coverage.faceAmount`
                    )}
                    ddAriaLabel={faceAmountStr}
                >
                    {formatIllustrationDetailYearlyCurrency(t, faceAmount)}
                </ContentEntry>
                <ContentEntry
                    label={t(
                        'clientCase.illustrationDetails.coverage.termLength'
                    )}
                >
                    <span className="[font:var(--typography-content-body-bold)]">
                        {t('clientCase.illustrationDetails.numYears', {
                            years: planYears,
                        })}
                    </span>
                </ContentEntry>
            </dl>
        </ContentSection>
    );
}
