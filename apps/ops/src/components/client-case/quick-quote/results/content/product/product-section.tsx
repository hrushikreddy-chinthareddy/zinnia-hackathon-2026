import { useTranslation } from 'react-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';

import { QuickQuoteProductHeaderRow } from './product-header-row';
import styles from '../content.module.css';
import { QuickQuoteTotalPremiumRangeSection } from './total-premium-range-section';
import { useQuickQuoteResults } from '../results-context';

export const QuickQuoteResultProductSection = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const { results } = useQuickQuoteResults();

    if (!results) {
        return null;
    }

    return (
        <section className={styles.contentSection}>
            <Typography variant={TypographyVariant.Body}>
                {t('clientCase.quickQuoteResults.subtitle')}
            </Typography>

            <div className={styles.contentSubtable}>
                <QuickQuoteProductHeaderRow
                    products={results.map(({ product }) => product)}
                />
                <QuickQuoteTotalPremiumRangeSection />
            </div>
        </section>
    );
};
