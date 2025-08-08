import { useTranslation } from 'next-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { numberFormatify } from '@deps/helpers/numbers.helpers';

import ContentEntry from './content-entry';
import ContentSection from './content-section';
import styles from './summary.module.css';
import { useIllustrationPremiumData } from '../../details/content/illustration-details-content-premium';

export default function IllustrationSelectForApplicationSectionPremium() {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const entries = useIllustrationPremiumData();

    return (
        <ContentSection
            title={t('clientCase.illustrationDetails.premium.title')}
        >
            <dl className={styles.contentSectionContainer}>
                {entries.map((item, idx) => {
                    const { label } = item;
                    if (item.type === 'text') {
                        const { format } = item;
                        return (
                            <ContentEntry key={label} label={label}>
                                {format()}
                            </ContentEntry>
                        );
                    }

                    const { value, format } = item;
                    return (
                        <ContentEntry
                            key={label}
                            label={label}
                            ddAriaLabel={
                                t(
                                    'clientCase.illustrationDetails.ariaValuePerYear',
                                    { value: numberFormatify(value) }
                                ) ?? undefined
                            }
                        >
                            {format(idx === 0)}
                        </ContentEntry>
                    );
                })}
            </dl>
        </ContentSection>
    );
}
