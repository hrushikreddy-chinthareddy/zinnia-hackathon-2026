import { useTranslation } from 'react-i18next';

import { useIllustrationDetail } from '@deps/components/illustrations/providers/IllustrationDetailProvider';
import { TranslationFiles } from '@deps/config/translations';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import ContentEntry from './illustration-details-content-entry';
import ContentSection from './illustration-details-content-section';

const premiumClassLabelMap = {
    STANDARDNONTOBACCO: 'Platinum',
    STANDARDPLUSNONTOBACCO: 'Platinum Choice',
    PREFERREDNONTOBACCO: 'Platinum Plus',
    ELITENONTOBACCO: 'Platinum Elite',
    STANDARDTOBACCO: 'Gold',
    PREFERREDTOBACCO: 'Gold Plus',
    juvenile: 'Juvenile',
    juvenileSubstandard: 'Juvenile Substandard',
    platinumSubstandard: 'Platinum Substandard',
    goldSubstandard: 'Gold Substandard',
};

export default function ContentInsured() {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const illustration = useIllustrationDetail();

    const issueAgeLabel = t('clientCase.illustrationDetails.insured.issueAge');
    const premiumClassLabel = t(
        'clientCase.illustrationDetails.insured.premiumClass'
    );
    const contentSectionTitle = t(
        'clientCase.illustrationDetails.insured.title'
    );

    const underwritingClass =
        illustration?.inputs.coverages[0]?.participants[0]?.underwritingClass;

    const premiumClassValue =
        premiumClassLabelMap[
            underwritingClass as keyof typeof premiumClassLabelMap
        ] ?? DEFAULT_ERROR_STRING;

    const issueAgeValue =
        illustration?.inputs.coverages[0]?.participants[0]?.issueAge ??
        DEFAULT_ERROR_STRING;

    return (
        <ContentSection title={contentSectionTitle}>
            <ContentEntry label={issueAgeLabel}>{issueAgeValue}</ContentEntry>
            <ContentEntry label={premiumClassLabel}>
                {premiumClassValue}
            </ContentEntry>
        </ContentSection>
    );
}
