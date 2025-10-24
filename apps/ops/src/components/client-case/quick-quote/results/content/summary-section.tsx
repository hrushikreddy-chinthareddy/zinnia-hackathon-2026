import { useTranslation } from 'react-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';

import styles from './content.module.css';
import { QuickQuoteBasePremiumRangeSection } from './coverage/base-premium-range-section';
import { QuickQuotePremiumFreeRidersSection } from './riders/premium-free-riders-section';
import { QuickQuoteRidersSection } from './riders/riders-section';

export const QuickQuoteResultSummarySection = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});

    return (
        <section className={styles.contentSection}>
            <Typography variant={TypographyVariant.LabelMd} asTag="h4">
                {t('clientCase.quickQuoteResults.coverage.title')}
            </Typography>

            <div className={styles.contentSubtable}>
                <QuickQuoteBasePremiumRangeSection />

                <QuickQuoteRidersSection />

                <QuickQuotePremiumFreeRidersSection />
            </div>
        </section>
    );
};
