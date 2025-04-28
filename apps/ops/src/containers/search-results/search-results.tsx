import { useTranslation } from 'next-i18next';
import { ReactNode } from 'react';

import { PageLoader, PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import { TranslationFiles } from '@deps/config/translations';

import SearchResultsEmptyCard from './search-results-empty-card/search-results-empty-card';
import SearchResultsErrorCard from './search-results-error-card/search-results-error-card';
import SearchResultsStartCard from './search-results-start-card/search-results-start-card';

import { default as styles } from './search-results.module.css';

export interface QueryResult {
    error?: any;
    isEmpty?: boolean;
    isError: boolean;
    isIdle: boolean;
    isLoading: boolean;
    isSuccess: boolean;
}

interface SearchResultsProps {
    children: ReactNode;
    query: QueryResult;
}

const SearchResults = ({ query, children }: SearchResultsProps) => {
    const { error, isEmpty, isError, isIdle, isLoading, isSuccess } = query;

    const { t } = useTranslation(TranslationFiles.COMMON);

    const header = <h2 className="typography-desktop-headline-2-d">{t('dashboard.h2')}</h2>;

    if (isLoading) {
        children = (
            <div className={styles.loadingContainer}>
                <PageLoader variant={PageLoaderVariant.Center} />
            </div>
        );
    } else if (isError) {
        if (error?.response?.status === 404) {
            children = <SearchResultsEmptyCard />;
        } else {
            children = <SearchResultsErrorCard />;
        }
    } else if (isIdle) {
        children = <SearchResultsStartCard />;
    } else if (isSuccess && isEmpty) {
        children = <SearchResultsEmptyCard />;
    }

    return (
        <div className={styles.searchResultsContainer}>
            {header}
            {children}
        </div>
    );
};

export default SearchResults;
