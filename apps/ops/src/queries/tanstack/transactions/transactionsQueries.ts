import { hasFilter } from '@deps/components/history/filters/filter.helpers';
import { getEvents } from '@deps/containers/subpages/activity-sub-page/event-feed/event-feed.helpers';
import { HistoryFilters } from '@deps/contexts/HistoryFiltersContext';
import { getPolicyTransactions } from '@deps/queries/api/policies';

interface GetTransactionsProps {
    historyFilters: HistoryFilters;
    policyNumber?: string;
    planCode?: string;
    sortField?: 'PROCESSDATE' | 'EFFECTIVEDATE' | 'REVERSALDATE';
    sortOrder?: 'ASC' | 'DESC';
}

export const getTransactionsQuery = async ({
    historyFilters,
    policyNumber,
    planCode,
    sortField = 'EFFECTIVEDATE',
    sortOrder = 'DESC',
}: GetTransactionsProps) => {
    if (!policyNumber) {
        throw 'No policy number provided';
    }
    if (!planCode) {
        throw 'No plan code provided';
    }
    const { eventFilter, yearFilter, statusFilter } = historyFilters;
    const transactionTypes = getEvents(eventFilter);

    const results = await getPolicyTransactions({
        transactionTypes: transactionTypes,
        id: policyNumber,
        planCode: planCode,
        sortField,
        sortOrder,
        status: statusFilter,
        ...(hasFilter(yearFilter) && { year: yearFilter }),
    });

    return results;
};
