import { Pagination } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useState } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import { useIllustrationsClientCase } from '@deps/contexts/illustrations/IllustrationsClientCaseContext';

import styles from './client-case-paginator.module.css';

export const ClientCasePaginator = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const { filters, setFilters, defaultLimit, results } =
        useIllustrationsClientCase();

    const [limit, setLimit] = useState<number>(results.limit || defaultLimit);
    const [offset, setOffset] = useState<number>(results.offset || 0);
    const [total, setTotal] = useState<number>(results?.total || 0);

    useEffect(() => {
        setLimit(filters.limit || defaultLimit);
        setOffset(filters.offset || 0);
        setTotal(results?.total || 0);
    }, [filters, defaultLimit, results]);

    const goToPage = useCallback(
        (pageNumber: number) => {
            setFilters({ ...filters, offset: (pageNumber - 1) * limit });
        },
        [setFilters, filters, limit]
    );

    return (
        <div className={styles.paginatorContainer}>
            <div>
                <p>{`${t('Results')}: ${offset + 1}-${Math.min(
                    offset + limit,
                    total
                )} ${t('of')} ${total}`}</p>
            </div>
            {total > limit && (
                <div>
                    <Pagination
                        limit={limit}
                        offset={offset}
                        total={total}
                        goToPage={goToPage}
                    />
                </div>
            )}
            <div className={styles.emptyColumn}></div>
        </div>
    );
};
