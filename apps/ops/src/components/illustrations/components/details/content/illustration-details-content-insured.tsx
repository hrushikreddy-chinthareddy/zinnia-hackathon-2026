import { useTranslation } from 'react-i18next';

import { UnderwritingClass } from '@deps/components/illustrations/helpers/illustrationApiSchemas';
import { useIllustrationDetail } from '@deps/components/illustrations/providers/IllustrationDetailProvider';
import { TranslationFiles } from '@deps/config/translations';
import { COVERAGE_IDS } from '@deps/queries/api/v3/illustrations/types';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import ContentEntry from './illustration-details-content-entry';
import ContentSection from './illustration-details-content-section';

export const PREMIUM_CLASS_LABEL_MAP = {
    STANDARDNONTOBACCO: 'Platinum',
    STANDARDPLUSNONTOBACCO: 'Platinum Choice',
    PREFERREDNONTOBACCO: 'Platinum Plus',
    ELITENONTOBACCO: 'Platinum Elite',
    STANDARDTOBACCO: 'Gold',
    PREFERREDTOBACCO: 'Gold Plus',
} as const satisfies Partial<Record<UnderwritingClass, string>>;

export const JUVENILE_LABEL_MAP = {
    juvenile: 'Juvenile',
    juvenileSubstandard: 'Juvenile Substandard',
} as const;

export const SUBSTANDARD_LABEL_MAP = {
    platinumSubstandard: 'Platinum Substandard',
    goldSubstandard: 'Gold Substandard',
} as const;

export const useIllustrationInsuredPremiumClass = () => {
    const illustration = useIllustrationDetail();
    const baseCoverage = illustration?.inputs.coverages.find(
        (coverage) => coverage.coverageId === COVERAGE_IDS.BASE_COVERAGE
    );

    const participant = baseCoverage?.participants[0];
    if (!participant) {
        return DEFAULT_ERROR_STRING;
    }

    const { underwritingClass, subStandardRating, issueAge } =
        participant ?? {};

    if (issueAge <= 17) {
        return !subStandardRating
            ? JUVENILE_LABEL_MAP.juvenile
            : JUVENILE_LABEL_MAP.juvenileSubstandard;
    }

    if (subStandardRating) {
        return underwritingClass === UnderwritingClass.STANDARDNONTOBACCO
            ? SUBSTANDARD_LABEL_MAP.platinumSubstandard
            : SUBSTANDARD_LABEL_MAP.goldSubstandard;
    }

    return (
        PREMIUM_CLASS_LABEL_MAP[
            participant.underwritingClass as keyof typeof PREMIUM_CLASS_LABEL_MAP
        ] ?? DEFAULT_ERROR_STRING
    );
};

export default function ContentInsured() {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const premiumClass = useIllustrationInsuredPremiumClass();
    const illustration = useIllustrationDetail();

    const issueAgeLabel = t('clientCase.illustrationDetails.insured.issueAge');
    const premiumClassLabel = t(
        'clientCase.illustrationDetails.insured.premiumClass'
    );
    const contentSectionTitle = t(
        'clientCase.illustrationDetails.insured.title'
    );

    const issueAgeValue =
        illustration?.inputs.coverages[0]?.participants[0]?.issueAge ??
        DEFAULT_ERROR_STRING;

    return (
        <ContentSection title={contentSectionTitle}>
            <ContentEntry label={issueAgeLabel}>{issueAgeValue}</ContentEntry>
            <ContentEntry label={premiumClassLabel}>
                {premiumClass}
            </ContentEntry>
        </ContentSection>
    );
}
