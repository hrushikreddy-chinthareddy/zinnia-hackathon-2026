import { useTranslation } from 'react-i18next';

import { TranslationFiles } from '@deps/config/translations';
import {
    NO_PARAM_RIDERS,
    RIDERS_WITH_FACE_AMOUNT,
} from '@deps/types/quickQuote';

import { QuickQuoteResultTableSection } from '../base/result-table-section';
import { useQuickQuoteResults } from '../results-context';
import { QuickQuoteRiderRow } from './rider-row';
import { QuickQuoteRiderSubtotalRow } from './rider-subtotal-row';

export const QuickQuoteRidersSection = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const { results } = useQuickQuoteResults();

    if (!results) {
        return null;
    }

    return (
        <QuickQuoteResultTableSection
            title={t('clientCase.quickQuoteResults.riders.title')}
        >
            {[...RIDERS_WITH_FACE_AMOUNT, ...NO_PARAM_RIDERS].map(
                (riderName) => (
                    <QuickQuoteRiderRow key={riderName} riderName={riderName} />
                )
            )}

            <QuickQuoteRiderSubtotalRow />
        </QuickQuoteResultTableSection>
    );
};
