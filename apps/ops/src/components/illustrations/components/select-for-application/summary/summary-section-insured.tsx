import { useTranslation } from 'react-i18next';

import { useIllustrationDetail } from '@deps/components/illustrations/providers/IllustrationDetailProvider';
import { TranslationFiles } from '@deps/config/translations';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';

import ContentEntry from './content-entry';
import ContentSection from './content-section';
import styles from './summary.module.css';
import { PREMIUM_CLASS_LABEL_MAP } from '../../details/content/illustration-details-content-insured';
export default function IllustrationSelectForApplicationSectionInsured() {
    const illustration = useIllustrationDetail();
    const { t } = useTranslation(TranslationFiles.COMMON, {});

    const firstParticipant =
        illustration?.inputs?.coverages?.[0]?.participants?.[0] ?? undefined;
    let issueAge: string | number = DEFAULT_ERROR_STRING;
    let premiumClass = DEFAULT_ERROR_STRING;

    if (firstParticipant) {
        issueAge = firstParticipant.issueAge;
        premiumClass =
            PREMIUM_CLASS_LABEL_MAP[
                firstParticipant.underwritingClass as keyof typeof PREMIUM_CLASS_LABEL_MAP
            ];
    }

    return (
        <ContentSection
            title={t('clientCase.illustrationDetails.insured.title')}
        >
            <dl className={styles.contentSectionContainer}>
                <ContentEntry
                    label={t('clientCase.illustrationDetails.insured.issueAge')}
                >
                    <span>{issueAge}</span>
                </ContentEntry>
                <ContentEntry
                    label={t(
                        'clientCase.illustrationDetails.insured.premiumClass'
                    )}
                >
                    <span>{premiumClass}</span>
                </ContentEntry>
            </dl>
        </ContentSection>
    );
}
