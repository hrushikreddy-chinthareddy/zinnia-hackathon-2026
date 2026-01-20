import { get, uniq } from 'lodash';
import { useTranslation } from 'react-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { isTermResult } from '@deps/types/quickQuote';

import { QuickQuoteResultTableRow } from '../base/result-table-row';
import { QuickQuoteResultTableSection } from '../base/result-table-section';
import { useQuickQuoteResults } from '../results-context';

export const QuickQuoteTotalPremiumRangeSection = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const { results, filterIneligibilityReasons, hasRiderErrorsByTermLength } =
        useQuickQuoteResults();

    if (!results) {
        return null;
    }

    const termResults = results?.filter(isTermResult);

    const termLengths = uniq(
        termResults?.flatMap((termResult) =>
            get(termResult, ['data', 'totalPremiumRange']).map(
                ({ termLength }) => termLength
            )
        )
    ).toSorted();

    if (!termLengths) {
        return null;
    }

    const rows = termLengths.map((termLength) => (
        <QuickQuoteResultTableRow
            key={termLength}
            cellsVariant={TypographyVariant.BodySmBold}
            rowHeader={
                <Typography variant={TypographyVariant.LabelLg}>
                    {t(
                        'clientCase.quickQuoteResults.product.totalPremiumRangeRowHeader',
                        { years: termLength }
                    )}
                </Typography>
            }
            data={results.map((result) => {
                const item = result.data.totalPremiumRange.find(
                    (totalPremiumRange) =>
                        totalPremiumRange.termLength === termLength
                );

                let reasons = undefined;
                if (item && item.range == null)
                    reasons = filterIneligibilityReasons(
                        item.notAvailabilityReasonField
                    );

                return {
                    value: item?.range,
                    period: 'mo.',
                    notAvailabilityReasons: reasons,
                    hasRiderErrors: hasRiderErrorsByTermLength(
                        result.data.riders,
                        termLength
                    ),
                };
            })}
        />
    ));

    return (
        <QuickQuoteResultTableSection
            title={t('clientCase.quickQuoteResults.product.totalPremiumRange')}
            subtitle={
                t(
                    'clientCase.quickQuoteResults.product.totalPremiumRangeSubtitle'
                ) as string
            }
        >
            {rows}
        </QuickQuoteResultTableSection>
    );
};
