import { useTranslation } from 'next-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { OutputCoverageValues } from '@deps/queries/api/client/documents/v3/illustrations';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import ContentEntry from './illustration-details-content-entry';
import ContentSection from './illustration-details-content-section';
import { useIllustrationData } from '../illustration-data-provider';
import { ridersLabelMap } from './riders-label-map';

export function useIllustrationRidersData() {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const illustration = useIllustrationData();

    if (!illustration) {
        return [];
    }

    const { coverages } = illustration.response.assumed;

    if (Object.keys(coverages).length === 1) {
        return [];
    }

    return Object.keys(coverages)
        .filter((k) => k !== 'base')
        .map((riderName) => {
            const { premium } =
                (
                    coverages as unknown as Record<
                        string,
                        OutputCoverageValues | undefined
                    >
                )[riderName] ?? {};
            return {
                label: t(ridersLabelMap[riderName] ?? riderName),
                value: numberFormatify(premium),
            };
        });
}
type IllustrationDetailsContentRidersProps = {
    isLoading: boolean;
};

export default function IllustrationDetailsContentRiders({
    isLoading,
}: IllustrationDetailsContentRidersProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const entries = useIllustrationRidersData();

    return (
        <ContentSection
            className="min-h-28"
            title={t('clientCase.illustrationDetails.riders.title')}
        >
            <dl className="contents">
                {!entries.length && (
                    <ContentEntry
                        label={t(
                            'clientCase.illustrationDetails.riders.noRiders'
                        )}
                    >
                        {DEFAULT_ERROR_STRING}
                    </ContentEntry>
                )}
                {entries.map(({ label, value }) => (
                    <ContentEntry
                        key={label}
                        label={label}
                        ddAriaLabel={
                            t(
                                'clientCase.illustrationDetails.ariaValuePerYear',
                                { value }
                            ) ?? undefined
                        }
                    >
                        <span className="[font:var(--typography-content-body)]">
                            {value.slice(0, -3)}
                        </span>
                        {t('clientCase.illustrationDetails.valuePerYear', {
                            value: value.slice(-3),
                        })}
                    </ContentEntry>
                ))}
            </dl>
            {!!entries.length && (
                <div className="col-span-2 col-start-2 text-end [font:var(--typography-labels-label-sm-alt)] [color:var(--color-base-text-text-secondary)]">
                    {t(
                        'clientCase.illustrationDetails.riders.includedInPremiumsFootNote'
                    )}
                </div>
            )}
        </ContentSection>
    );
}
