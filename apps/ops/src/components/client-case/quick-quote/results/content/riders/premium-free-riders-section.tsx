import { useTranslation } from 'react-i18next';

import { useRidersLabelMap } from '@deps/components/illustrations/components/details/content/use-riders-label-map';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { PREMIUM_FREE_RIDERS } from '@deps/types/quickQuote';

import { QuickQuoteRangeCell } from '../base/range-cell';
import { QuickQuoteResultTableRow } from '../base/result-table-row';
import { QuickQuoteResultTableSection } from '../base/result-table-section';
import styles from '../content.module.css';
import { useQuickQuoteResults } from '../results-context';

export const QuickQuotePremiumFreeRidersSection = () => {
    const riderLabelMap = useRidersLabelMap();
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const { results } = useQuickQuoteResults();

    if (!results) {
        return null;
    }

    // Show the rider if it's available to any result
    const riders = PREMIUM_FREE_RIDERS.filter((riderName) => {
        return results.some((result) => result.data.riders[riderName]);
    });

    const rows = riders.map((riderName) => (
        <QuickQuoteResultTableRow
            key={riderName}
            rowHeader={
                <Typography variant={TypographyVariant.BodySm}>
                    {riderLabelMap[riderName!]}
                </Typography>
            }
        >
            <QuickQuoteRangeCell
                className={styles.premiumFreeRiderContent}
                value={0}
                period="mo."
            />
        </QuickQuoteResultTableRow>
    ));

    return (
        <QuickQuoteResultTableSection
            title={t('clientCase.quickQuoteResults.riders.premiumFreeRiders')}
            headingClass={styles.premiumFreeRidersHeading}
        >
            {rows}
        </QuickQuoteResultTableSection>
    );
};
