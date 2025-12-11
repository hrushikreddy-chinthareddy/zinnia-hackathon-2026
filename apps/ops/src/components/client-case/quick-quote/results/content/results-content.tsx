import { useTranslation } from 'react-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';

import styles from './content.module.css';
import MaskedContainer from './masked-container/masked-container';
import { QuickQuoteResultProductSection } from './product/product-section';
import { QuoteLoader } from './quote-loader/quote-loader';
import { useQuickQuoteResults } from './results-context';
import { QuickQuoteResultSummarySection } from './summary-section';

export const QuickQuoteResultsContent = () => {
    const { results, isFetching, isLoading } = useQuickQuoteResults();
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    return (
        <>
            <Typography
                variant={TypographyVariant.Body}
                className={styles.contentSubtitle}
            >
                {t('clientCase.quickQuoteResults.subtitle')}
            </Typography>
            <MaskedContainer
                isLoading={isFetching || isLoading}
                overlay={<QuoteLoader />}
            >
                <div
                    className={styles.contentMainTable}
                    style={{
                        gridTemplateColumns: `minmax(max-content, 420px) repeat(${results?.length}, minmax(auto, 360px))`,
                    }}
                >
                    <QuickQuoteResultProductSection />
                    <QuickQuoteResultSummarySection />
                </div>
            </MaskedContainer>
        </>
    );
};
