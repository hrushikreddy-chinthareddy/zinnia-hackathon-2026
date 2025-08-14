import { useTranslation } from 'next-i18next';

import { useIllustrationDetail } from '@deps/components/illustrations/providers/IllustrationDetailProvider';
import { TranslationFiles } from '@deps/config/translations';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { ProductTypes } from '@deps/types/product';

import ContentEntry from './content-entry';
import ContentSection from './content-section';
import styles from './summary.module.css';
import { useIllustrationRidersData } from '../../details/content/use-riders-data';

export default function IllustrationSelectForApplicationSectionRiders() {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const entries = useIllustrationRidersData();
    const illustration = useIllustrationDetail();

    const isIUL =
        illustration?.productType === ProductTypes.INDEX_UNIVERSAL_LIFE;

    return (
        <ContentSection
            title={t('clientCase.illustrationDetails.riders.title')}
        >
            <dl className={styles.contentSectionContainer}>
                {!entries.length && (
                    <ContentEntry
                        label={t(
                            'clientCase.illustrationDetails.riders.noRiders'
                        )}
                    >
                        {DEFAULT_ERROR_STRING}
                    </ContentEntry>
                )}
                {entries.map(({ label, format }) => (
                    <ContentEntry
                        key={label}
                        label={label}
                        ddAriaLabel={
                            (!isIUL &&
                                t(
                                    'clientCase.illustrationDetails.ariaValuePerYear',
                                    { value: format() }
                                )) ||
                            undefined
                        }
                    >
                        {isIUL
                            ? t(
                                  'clientCase.illustrationDetails.riders.included'
                              )
                            : format()}
                    </ContentEntry>
                ))}
            </dl>
            {!!entries.length && !isIUL && (
                <div className={styles.ridersSectionFootnote}>
                    {t(
                        'clientCase.illustrationDetails.riders.includedInPremiumsFootNote'
                    )}
                </div>
            )}
        </ContentSection>
    );
}
