import clsx from 'clsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { usePrintContext } from '@deps/contexts/printContext';

import styles from './content.module.css';
import MaskedContainer from './masked-container/masked-container';
import { QuickQuoteResultProductSection } from './product/product-section';
import { QuoteLoader } from './quote-loader/quote-loader';
import { useQuickQuoteResults } from './results-context';
import { QuickQuoteResultSummarySection } from './summary-section';

export const QuickQuoteResultsContent = () => {
    const { results, isFetching, isLoading } = useQuickQuoteResults();
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const { isPrinting } = usePrintContext();

    const tableContainerClassnames = clsx(styles.contentMainTable, {
        [styles.contentMainTableConfigDisplay]: !isPrinting,
        [styles.contentMainTableConfigPrint]: isPrinting,
    });

    const tableContainerColumnsStyle = {
        '--column-number': results?.length ?? 0,
    } as React.CSSProperties;

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
                    className={tableContainerClassnames}
                    style={tableContainerColumnsStyle}
                >
                    <QuickQuoteResultProductSection />
                    <QuickQuoteResultSummarySection />
                </div>
            </MaskedContainer>
        </>
    );
};
