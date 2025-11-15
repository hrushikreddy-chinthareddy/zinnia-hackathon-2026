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

export const QuickQuoteBasePremiumRangeSection = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const { results } = useQuickQuoteResults();

    if (!results) {
        return null;
    }

    const termResults = results?.filter(isTermResult);

    const termLengths = uniq(
        termResults?.flatMap((termResult) =>
            get(termResult, ['data', 'basePremiumRange']).map(
                ({ termLength }) => termLength
            )
        )
    ).toSorted();

    if (!termLengths) {
        return null;
    }

    const rows = termLengths?.map((termLength) => (
        <QuickQuoteResultTableRow
            key={termLength}
            rowHeader={
                <Typography variant={TypographyVariant.BodySm}>
                    {t(
                        'clientCase.quickQuoteResults.product.totalPremiumRangeRowHeader',
                        { years: termLength }
                    )}
                </Typography>
            }
            data={results.map((result) => {
                const item = result.data.basePremiumRange.find(
                    (basePremiumRange) =>
                        basePremiumRange.termLength === termLength
                );

                return {
                    value: item?.range,
                    notAvailabilityReason:
                        item && item.range == null
                            ? item.notAvailabilityReasonField
                            : undefined,
                    period: 'mo.',
                };
            })}
        />
    ));

    return (
        <QuickQuoteResultTableSection
            title={t('clientCase.quickQuoteResults.coverage.basePremiumRange')}
            hint={t('clientCase.quickQuoteResults.coverage.hint') as string}
        >
            {rows}
        </QuickQuoteResultTableSection>
    );
};
