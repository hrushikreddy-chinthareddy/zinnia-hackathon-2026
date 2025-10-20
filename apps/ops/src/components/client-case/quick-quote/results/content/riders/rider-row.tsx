import { NumberOrRange, QuickQuoteFormState } from '../../../types';
import { QuickQuoteResultTableRow } from '../base/result-table-row';
import { useQuickQuoteResults } from '../results-context';
import { QuickQuoteRiderRowHeader } from './rider-row-header';

type QuickQuoteRiderRowProps = {
    riderName: keyof QuickQuoteFormState['riders'];
};

export const QuickQuoteRiderRow = (props: QuickQuoteRiderRowProps) => {
    const { results } = useQuickQuoteResults();
    const { riderName } = props;

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
            data={data}
        />
    );
};
