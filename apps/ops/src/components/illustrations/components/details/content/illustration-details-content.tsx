import { useTranslation } from 'next-i18next';

import { useIllustrationDetail } from '@deps/components/illustrations/providers/IllustrationDetailProvider';
import { TranslationFiles } from '@deps/config/translations';
import { ProductTypes } from '@deps/types/product';

import styles from './details-content.module.css';
import ContentCashValue from './illustration-details-content-cash-value';
import CoverageSection from './illustration-details-content-coverage';
import ContentInsured from './illustration-details-content-insured';
import IulContentCoverage from './illustration-details-content-iul-coverage';
import ContentPremium from './illustration-details-content-premium';
import ContentRiders from './riders-section';

export default function IllustrationDetailsContent() {
    const { t } = useTranslation(TranslationFiles.COMMON, {});

    const illustration = useIllustrationDetail();

    if (illustration?.productType === ProductTypes.INDEX_UNIVERSAL_LIFE) {
        return (
            <div className={styles.detailsContent} id="printable-no-scroll">
                <ContentInsured />
                <IulContentCoverage />
                <ContentPremium />
                <ContentRiders />
                <ContentCashValue />
            </div>
        );
    }

    return (
        <div className={styles.detailsContent} id="printable-no-scroll">
            <ContentInsured />
            <CoverageSection />
            <ContentPremium />
            <ContentRiders />
            <ContentCashValue
                title={t('clientCase.illustrationDetails.cashValue')}
            />
        </div>
    );
}
