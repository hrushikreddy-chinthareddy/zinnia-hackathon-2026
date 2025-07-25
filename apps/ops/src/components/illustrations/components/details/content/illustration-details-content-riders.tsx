import { useTranslation } from 'next-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { OutputCoverageValues } from '@deps/queries/api/client/documents/v3/illustrations';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import ContentEntry from './illustration-details-content-entry';
import ContentSection from './illustration-details-content-section';
import { useRidersLabelMap } from './use-riders-label-map';
import { useIllustrationDetail } from '../../../providers/IllustrationDetailProvider';

export function useIllustrationRidersData() {
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
            const { premium } =
                (
                    coverages as unknown as Record<
                        string,
                        OutputCoverageValues | undefined
                    >
                )[riderName] ?? {};
            return {
                label: ridersLabelMap?.[riderName] ?? riderName,
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
