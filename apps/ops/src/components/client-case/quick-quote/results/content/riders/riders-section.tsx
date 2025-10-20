import { useTranslation } from 'react-i18next';

import { TranslationFiles } from '@deps/config/translations';

import { QuickQuoteResultTableSection } from '../base/result-table-section';
import { useQuickQuoteResults } from '../results-context';
import { QuickQuoteRiderRow } from './rider-row';
import { NO_PARAM_RIDERS, RIDERS_WITH_FACE_AMOUNT } from '../../../config';

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
            {/*
            <QuickQuoteResultTableRow>
                {results.map((result, idx) => {
                    if (idx === 0) {
                        return;
                    }

                    return <QuickQuoteRangeCell value={} />;
                })}
            </QuickQuoteResultTableRow>
          */}
        </QuickQuoteResultTableSection>
    );
};
