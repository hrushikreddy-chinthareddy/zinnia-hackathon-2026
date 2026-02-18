import {
    Icon,
    IconType,
    TableCell,
    TableRow,
    Button,
    Table,
    TableHeader,
    TableHeaderCell,
    TableBody,
    Pagination,
} from '@zinnia/bloom/components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ErrorMessage } from '@deps/components/dashboard/components/errors';
import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { downloadCSV } from '@deps/components/dashboard/download-csv';
import { ChartHeader } from '@deps/components/dashboard/header-components/chart-header';
import { getCarrierName } from '@deps/components/dashboard/sections/completed-task-times/utils';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { toTitleCase } from '@deps/helpers/string.helpers';
import {
    SortOrder,
    useTableOptions,
} from '@deps/hooks/dashboard/useTableOptions';
import { useDashboardStore } from '@deps/store/store';

import styles from './retention-attrition-table.module.css';
import { useRetentionAttrition } from '../context/retention-attrition-context';
import { RetentionAttritionFilters } from '../shared/retention-attrition-filters';
import {
    flattenRetentionAttritionData,
    generateCsvColumns,
    generateRetentionAttritionCSVFilename,
} from '../utils';

enum SortByOptions {
    TOTAL = 'total',
}

const SORT_ORDER_ARIA: Record<SortOrder, 'ascending' | 'descending'> = {
    [SortOrder.ASC]: 'ascending',
    [SortOrder.DESC]: 'descending',
};

export const RetentionAttritionTable = () => {
    const [offset, setOffset] = useState(0);
    const limit = 6; // Show 6 case types per page

    const {
        retentionAttritionData,
        retentionAttritionDataFetching,
        retentionAttritionDataLoading,
        retentionAttritionDataError,
        timerange,
    } = useRetentionAttrition();

    const { selectedCarriers } = useDashboardStore((state) => state);

    const { t } = useTranslation();

    const carrierName = useMemo(
        () => getCarrierName(selectedCarriers, t),
        [selectedCarriers, t]
    );

    const flattenedData = useMemo(
        () => flattenRetentionAttritionData(retentionAttritionData),
        [retentionAttritionData]
    );

    const csvFileName = useMemo(
        () => generateRetentionAttritionCSVFilename(carrierName, timerange, t),
        [carrierName, timerange, t]
    );

    const { handleSort, sortedData, sortOrder } = useTableOptions({
        sortByDefault: SortByOptions.TOTAL,
        dataToSort: retentionAttritionData || [],
    });

    const paginatedData = useMemo(() => {
        return sortedData.slice(offset, offset + limit);
    }, [offset, limit, sortedData]);

    const goToPage = useCallback(
        (pageNumber: number) => {
            setOffset((pageNumber - 1) * limit);
        },
        [limit]
    );

    useEffect(() => {
        goToPage(1);
    }, [goToPage, sortedData]);

    const generateExpandableContent = (
        productName: string,
        policyContract: {
            productName: string;
            status: string;
            count: number;
        }[],
        total: number
    ) => {
        return policyContract.map((pC) => (
            <TableRow key={`${productName}-${pC.productName}`}>
                <TableCell>
                    <span className={styles.srOnly}>{productName}</span>
                </TableCell>
                <TableCell>{pC.status}</TableCell>
                <TableCell>
                    {((pC.count / total) * 100).toFixed(2).toLocaleString()}{' '}
                    {'%'}
                </TableCell>
            </TableRow>
        ));
    };

    const handleExportCSV = useCallback(() => {
        downloadCSV(flattenedData, csvFileName, generateCsvColumns(t));
    }, [flattenedData, csvFileName, t]);

    const isDataLoaded =
        !retentionAttritionDataFetching && !retentionAttritionDataLoading;
    const hasNoData = (sortedData?.length ?? 0) === 0;
    const showErrorMessage =
        retentionAttritionDataError || (isDataLoaded && hasNoData);
    const errorMessageText = retentionAttritionDataError
        ? t('allFields.completedTaskTimesErrorState')
        : t('allFields.retentionAttritionNoDataState');

    return (
        <CardContainer containerClassNames={styles.containerFullWidth}>
            <div className={styles.exportContainer}>
                <ChartHeader
                    title={t('allFields.retentionAttritionTitle')}
                    subtitle={null}
                />
                <Button
                    mode="link"
                    size="small"
                    className={styles.exportContainerButton}
                    onClick={handleExportCSV}
                >
                    <Icon type={IconType.DOWNLOAD} />
                    <span>{t('allFields.exportCSV')}</span>
                </Button>
            </div>
            <RetentionAttritionFilters />
            <div
                className={`${sharedStyles.tableContainer} ${styles.tableWrapper}`}
            >
                <BlurOverlayLoader
                    loading={
                        retentionAttritionDataFetching ||
                        retentionAttritionDataLoading
                    }
                >
                    {showErrorMessage ? (
                        <ErrorMessage
                            className={styles.errorMessageContainer}
                            message={errorMessageText}
                        />
                    ) : (
                        <Table className={styles.retentionAttritionTable}>
                            <colgroup>
                                <col />
                                <col />
                                <col />
                            </colgroup>
                            <caption className={styles.srOnly}>
                                {t('allFields.retentionAttritionTitle')}
                            </caption>
                            <TableHeader>
                                <TableRow>
                                    <TableHeaderCell>
                                        {t('allFields.product')}
                                    </TableHeaderCell>
                                    <TableHeaderCell>
                                        {t('allFields.policyContractStatus')}
                                    </TableHeaderCell>
                                    <TableHeaderCell
                                        scope="col"
                                        aria-sort={SORT_ORDER_ARIA[sortOrder]}
                                        sortable
                                        className={styles.tableHeader}
                                        onClick={() =>
                                            handleSort(SortByOptions.TOTAL)
                                        }
                                    >
                                        <Typography
                                            variant={
                                                TypographyVariant.BodySmBold
                                            }
                                            className={styles.sortHeaderContent}
                                        >
                                            <span className={styles.srOnly}>
                                                Sort by Count{' '}
                                                {SORT_ORDER_ARIA[sortOrder]}
                                            </span>

                                            <span aria-hidden="true">
                                                {t('allFields.count')}
                                            </span>

                                            <Icon
                                                type={
                                                    sortOrder === SortOrder.ASC
                                                        ? IconType.ARROW_UP
                                                        : IconType.ARROW_DOWN
                                                }
                                                width={16}
                                                color="var(--color-base-icon-action-text-link)"
                                            />
                                        </Typography>
                                    </TableHeaderCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.map((item) => {
                                    return (
                                        <TableRow
                                            key={`${item.productName}-${item.total}`}
                                            isExpandable
                                            showChevron
                                            expandedContent={generateExpandableContent(
                                                item.productName,
                                                item.policyContract,
                                                item.total
                                            )}
                                        >
                                            <TableCell
                                                className={styles.chevronIcon}
                                            >
                                                {toTitleCase(item.productName)}
                                            </TableCell>
                                            <TableCell>
                                                {t('allFields.all')}
                                            </TableCell>
                                            <TableCell>
                                                {item.total.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                    {!retentionAttritionDataError &&
                        sortedData.length > limit && (
                            <div className={sharedStyles.paginationContainer}>
                                <Pagination
                                    limit={limit}
                                    offset={offset}
                                    total={sortedData?.length || 0}
                                    goToPage={goToPage}
                                />
                            </div>
                        )}
                </BlurOverlayLoader>
            </div>
        </CardContainer>
    );
};
