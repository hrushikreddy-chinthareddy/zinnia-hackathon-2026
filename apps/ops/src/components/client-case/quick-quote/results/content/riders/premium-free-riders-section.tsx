import { useTranslation } from 'react-i18next';

import { useRidersLabelMap } from '@deps/components/illustrations/components/details/content/use-riders-label-map';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { PREMIUM_FREE_RIDERS } from '@deps/types/quickQuote';
import { RiderDataItem } from '@deps/utils/quick-quotes-rules/types';

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

    const rows = PREMIUM_FREE_RIDERS.map((riderName) => {
        const data = results.map(
            (result): RiderDataItem => ({
                period: 'mo.',
                value: 0,
                ineligibilityReasons:
                    result.data.riders?.[riderName]?.ineligibilityReasonField,
            })
        );

        return (
            <QuickQuoteResultTableRow
                key={riderName}
                rowHeader={
                    <Typography variant={TypographyVariant.BodySm}>
                        {riderLabelMap[riderName]}
                    </Typography>
                }
                data={data}
            />
        );
    });

    return (
        <QuickQuoteResultTableSection
            title={t('clientCase.quickQuoteResults.riders.premiumFreeRiders')}
            headingClass={styles.premiumFreeRidersHeading}
        >
            {rows}
        </QuickQuoteResultTableSection>
    );
};
