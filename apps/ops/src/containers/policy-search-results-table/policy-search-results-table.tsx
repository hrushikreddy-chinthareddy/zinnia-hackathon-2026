import {
    Icon,
    IconType,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@zinnia/bloom/components';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { PolicySortBy } from '@deps/components/policy-index/types';
import { SortOrder } from '@deps/hooks/dashboard/useTableOptions';
import { PolicyReferenceSearchResponse } from '@deps/types/search';

import { PolicyRow } from './policy-row';
import styles from './policy-search-results-table.module.css';
interface PolicySearchResultsTableProps {
    data?: PolicyReferenceSearchResponse;
    handleSort: (sortBy: PolicySortBy) => void;
    sortOrder: SortOrder;
    isError: boolean;
    isFiltered?: boolean;
}

export const PolicySearchResultsTable: FC<PolicySearchResultsTableProps> = ({
    data,
    handleSort,
    sortOrder,
    isError,
    isFiltered,
}) => {
    const noData =
        isError || !data || !data.results || data?.results?.length === 0;

    const { t } = useTranslation();

    const getErrorMessage = () => {
        // Generic error message for both error and no data states
        if (isError || !data) {
            return (
                <>
                    <b>{t('dashboard.search.results.notFound')}</b>{' '}
                    {t('dashboard.search.results.tryAgain')}
                </>
            );
        }

        // No results from initial base query
        if (!isFiltered && (!data.results || data.results.length === 0)) {
            return (
                <>
                    <b>{t('dashboard.search.results.noResultsYet')}</b>{' '}
                    {t('dashboard.search.results.resultsSoon')}
                </>
            );
        }

        // No results from filtered query
        if (isFiltered && (!data.results || data.results.length === 0)) {
            return (
                <>
                    <b>{t('dashboard.search.results.noResultsForSearch')}</b>{' '}
                    {t('dashboard.search.results.tryAgain')}
                </>
            );
        }
    };

    const errorMessage = getErrorMessage();

    return (
        <Table className={styles.tableContainer}>
            <TableHeader>
                <TableRow>
                    <TableHeaderCell scope="col" className="sr-only">
                        View policy
                    </TableHeaderCell>
                    <TableHeaderCell scope="col">
                        {t('dashboard.search.results.table.policyContract')}
                    </TableHeaderCell>
                    <TableHeaderCell
                        scope="col"
                        className={styles.statusHeader}
                    >
                        {t('dashboard.search.results.table.status')}
                    </TableHeaderCell>
                    <TableHeaderCell scope="col">
                        {t('dashboard.search.results.table.ownerSSN')}
                    </TableHeaderCell>
                    <TableHeaderCell scope="col">
                        {t('dashboard.search.results.table.openCases')}
                    </TableHeaderCell>
                    <TableHeaderCell
                        scope="col"
                        sortable
                        onClick={() => handleSort(PolicySortBy.LAST_UPDATED)}
                    >
                        {t('dashboard.search.results.table.lastUpdated')}
                        <Icon
                            type={
                                sortOrder === SortOrder.ASC
                                    ? IconType.ARROW_UP
                                    : IconType.ARROW_DOWN
                            }
                            color="#00628B"
                        />
                    </TableHeaderCell>
                    <TableHeaderCell scope="col"></TableHeaderCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                {noData ? (
                    <TableRow className="text-center">
                        <TableCell colSpan={7}>
                            <p>{errorMessage}</p>
                        </TableCell>
                    </TableRow>
                ) : (
                    data?.results.map((item) => (
                        <PolicyRow key={item.id} item={item} />
                    ))
                )}
            </TableBody>
        </Table>
    );
};
