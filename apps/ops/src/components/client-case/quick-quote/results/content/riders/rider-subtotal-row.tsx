import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import {
    NO_PARAM_RIDERS,
    NumberOrRange,
    RIDERS_WITH_FACE_AMOUNT,
} from '@deps/types/quickQuote';

import { sumNumberOrRanges } from '../../../helpers';
import { QuickQuoteRangeCellText } from '../base/range-cell-text';
import { QuickQuoteResultTableRow } from '../base/result-table-row';
import styles from '../content.module.css';
import { useQuickQuoteResults } from '../results-context';

export const QuickQuoteRiderSubtotalRow = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const { results } = useQuickQuoteResults();

    if (!results?.length) {
        return null;
    }

    return (
        <QuickQuoteResultTableRow>
            {results.map((result, idx) => {
                const riderRanges = [
                    ...RIDERS_WITH_FACE_AMOUNT,
                    ...NO_PARAM_RIDERS,
                ]
                    .map((riderName) => result.data.riders[riderName]?.range)
                    .filter(
                        (value): value is NumberOrRange =>
                            value != null && typeof value !== 'boolean'
                    );

                const subtotal = sumNumberOrRanges(riderRanges);

                return (
                    <div
                        className={clsx(
                            styles.contentDataCell,
                            styles.riderSubtotalCell
                        )}
                        key={result.product.planCode}
                    >
                        {idx === 0 && (
                            <Typography variant={TypographyVariant.FieldLabel}>
                                {t(
                                    'clientCase.quickQuoteResults.riders.totalRiderPricing'
                                )}
                            </Typography>
                        )}
                        <QuickQuoteRangeCellText
                            className={styles.riderSubtotalCellText}
                            value={subtotal}
                            period="mo."
                        />
                    </div>
                );
            })}
        </QuickQuoteResultTableRow>
    );
};
