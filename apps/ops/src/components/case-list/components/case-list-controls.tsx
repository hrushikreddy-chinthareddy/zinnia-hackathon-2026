import { Dispatch, SetStateAction, useMemo } from 'react';

import PageSize from '@deps/components/pagination/page-size/page-size';
import PaginationControls from '@deps/components/pagination/pagination';
import { CaseSearchBody } from '@deps/types/search';

import {
    DEFAULT_OFFSET_COUNT,
    DEFAULT_PAGE_LIMIT,
    caseListSearchPageSizeOptions,
} from '../helpers/const';

export interface CaseListControlsProps {
    filters: CaseSearchBody | null;
    total: number;
    setFilters: Dispatch<SetStateAction<CaseSearchBody>>;
}
export const CaseListControls = ({
    filters,
    setFilters,
    total,
}: CaseListControlsProps) => {
    const pageSizeDropdown = useMemo(() => {
        return filters ? (
            <PageSize
                options={caseListSearchPageSizeOptions}
                value={`${filters.limit}`}
                handleChange={(value) => {
                    setFilters((prevFilters) => ({
                        ...prevFilters,
                        limit: Number(value),
                        offset: DEFAULT_OFFSET_COUNT,
                    }));
                    window.scrollTo(0, 0);
                }}
            />
        ) : null;
    }, [filters, setFilters]);

    const paginationControls = useMemo(() => {
        if (filters) {
            const goToPage = (pageNumber: number) => {
                setFilters((fs: CaseSearchBody) => ({
                    ...fs,
                    offset:
                        (pageNumber - 1) *
                        (filters?.limit ?? DEFAULT_PAGE_LIMIT),
                }));
                window.scrollTo(0, 0);
            };

            return (
                <PaginationControls
                    total={total}
                    limit={filters?.limit ?? DEFAULT_PAGE_LIMIT}
                    offset={filters?.offset ?? DEFAULT_OFFSET_COUNT}
                    goToPage={goToPage}
                />
            );
        }
    }, [filters, setFilters, total]);

    return (
        <>
            {total ? (
                <div
                    className="align-center mx-auto mt-4 grid grid-cols-4 lg:grid-cols-12 lg:pb-[120px]"
                    data-testid="case-list-controls"
                >
                    <div className="order-2 col-span-4 mt-8 flex items-center justify-center gap-1 pb-[120px] lg:order-1 lg:col-span-2 lg:mt-0 lg:pb-0">
                        {pageSizeDropdown}
                    </div>
                    <div className="order-1 col-span-4 lg:order-2 lg:col-span-8">
                        {paginationControls}
                    </div>
                </div>
            ) : null}
        </>
    );
};
