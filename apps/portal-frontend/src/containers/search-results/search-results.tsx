import { useTranslation } from 'next-i18next';
import { ReactNode } from 'react';

import { PageLoader, PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';

import SearchResultsEmptyCard from './search-results-empty-card/search-results-empty-card';
import SearchResultsErrorCard from './search-results-error-card/search-results-error-card';
import SearchResultsStartCard from './search-results-start-card/search-results-start-card';

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

    const header = (
        <Typography className="mb-4 mt-12" variant={TypographyVariant.H2}>
            {t('dashboard.h2')}
        </Typography>
    );

    if (isLoading) {
        children = (
            <div className="flex h-[500px] w-full items-center justify-center">
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
        <div className="prose">
            {header}
            {children}
        </div>
    );
};

export default SearchResults;
