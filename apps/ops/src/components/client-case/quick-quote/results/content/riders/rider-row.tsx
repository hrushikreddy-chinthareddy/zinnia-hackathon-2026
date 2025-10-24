import { useTranslation } from 'react-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { NumberOrRange, QuickQuoteFormState } from '@deps/types/quickQuote';

import { QuickQuoteResultTableRow } from '../base/result-table-row';
import { useQuickQuoteResults } from '../results-context';
import { QuickQuoteRiderRowHeader } from './rider-row-header';
import { useQuickQuoteParams } from '../../params-context';
import { QuickQuoteNotAvailableReasonCell } from '../base/not-available-reason-cell';

type QuickQuoteRiderRowProps = {
    riderName: keyof QuickQuoteFormState['riders'];
};

export const QuickQuoteRiderRow = (props: QuickQuoteRiderRowProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const { results } = useQuickQuoteResults();
    const params = useQuickQuoteParams();
    const { riderName } = props;
    const isActive = !!params.riders[riderName];

    if (!results) {
        return null;
    }

    const data = results.map((result) => ({
        period: 'mo.',
        value: result.data.riders?.[riderName] as NumberOrRange,
    }));

    return (
        <QuickQuoteResultTableRow
            rowHeader={<QuickQuoteRiderRowHeader riderName={riderName} />}
            data={isActive ? data : []}
        >
            {!isActive && (
                <QuickQuoteNotAvailableReasonCell>
                    {t(
                        'clientCase.quickQuoteResults.riders.disabledPlaceholder'
                    )}
                </QuickQuoteNotAvailableReasonCell>
            )}
        </QuickQuoteResultTableRow>
    );
};
