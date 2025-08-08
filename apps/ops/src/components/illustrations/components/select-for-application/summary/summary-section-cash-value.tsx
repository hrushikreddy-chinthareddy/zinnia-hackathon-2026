import { useTranslation } from 'react-i18next';

import { useIllustrationDetail } from '@deps/components/illustrations/providers/IllustrationDetailProvider';
import { TranslationFiles } from '@deps/config/translations';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { ProductTypes } from '@deps/types/product';

import ContentEntry from './content-entry';
import ContentSection from './content-section';
import styles from './summary.module.css';
import { useIllustrationCashValueData } from '../../details/content/illustration-details-content-cash-value';

export default function IllustrationSelectForApplicationContentCashValue() {
    const { t } = useTranslation(TranslationFiles.COMMON, {});

    const entries = useIllustrationCashValueData();
    const illustration = useIllustrationDetail();

    if (!entries.length) {
        return null;
    }

    return (
        <ContentSection
            title={
                illustration?.productType === ProductTypes.INDEX_UNIVERSAL_LIFE
                    ? t(
                          'clientCase.illustrationDetails.netSurrenderValue.title'
                      )
                    : t('clientCase.illustrationDetails.cashValue')
            }
        >
            <dl className={styles.contentSectionContainer}>
                {entries.map(({ label, value }) => (
                    <ContentEntry key={label} label={label}>
                        {numberFormatify(value, {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                        })}
                    </ContentEntry>
                ))}
            </dl>
        </ContentSection>
    );
}
