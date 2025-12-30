import { get, uniq } from 'lodash';
import { useTranslation } from 'react-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { isTermResult } from '@deps/types/quickQuote';
import { nonEligibleReasonByClass } from '@deps/utils/quick-quotes-rules/types';

import { QuickQuoteResultTableRow } from '../base/result-table-row';
import { QuickQuoteResultTableSection } from '../base/result-table-section';
import { useQuickQuoteResults } from '../results-context';

export const QuickQuoteTotalPremiumRangeSection = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const { results } = useQuickQuoteResults();
    console.log('🚀 ~ QuickQuoteTotalPremiumRangeSection ~ results:', results);

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

    const getNotAvailabilityFields = (
        reasons: nonEligibleReasonByClass[] | undefined
    ) => {
        if (!reasons || reasons.length === 0) return [];

        const filteredReasons = reasons
            .flatMap((reason) => reason.reasons)
            .filter(
                (reason, index, self) =>
                    index === self.findIndex((t) => t.field == reason.field)
            );

        filteredReasons.forEach((fr, i) => {
            reasons.forEach((reason) => {
                if (!reason.reasons.some((r) => r.field === fr.field))
                    filteredReasons.splice(i, 1);
            });
        });
    };

    const rows = termLengths?.map((termLength) => (
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

                const record = {
                    value: item?.range,
                    period: 'mo.',
                };

                if (item && item.range) return record;
                if (item && item.range == null)
                    getNotAvailabilityFields(item.notAvailabilityReasonField);
                return {
                    ...record,
                    notAvailabilityReason:
                        item && item.range == null
                            ? item.notAvailabilityReasonField
                            : undefined,
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
