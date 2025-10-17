import { NumberOrRange } from '../../../types';
import { QuickQuoteResultTableRow } from '../base/result-table-row';
import { useQuickQuoteResults } from '../results-context';
import {
    QuickQuoteRiderRowHeader,
    QuickQuoteRiderRowHeaderProps,
} from './rider-row-header';

type QuickQuoteRiderRowProps = QuickQuoteRiderRowHeaderProps;

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
            rowHeader={<QuickQuoteRiderRowHeader {...props} />}
            data={data}
        />
    );
};
