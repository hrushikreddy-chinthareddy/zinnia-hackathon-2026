import React, { useCallback, useMemo } from 'react';

import { generatePageNumbers } from '@deps/utils/pagination';

import { ArrowLeft, ArrowRight } from './arrows/arrows';

export interface PaginationParams {
    limit: number;
    offset: number;
}
export interface PaginationControlsProps extends PaginationParams {
    total: number;
    goToPage: (pageNumber: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ limit, offset, total, goToPage }) => {
    const currentPage = useMemo(() => Math.floor(offset / limit) + 1, [limit, offset]);
    const totalPages = useMemo(() => Math.ceil(total / limit), [limit, total]);

    const goToPreviousPage = useCallback(() => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    }, [currentPage, goToPage]);

    const goToNextPage = useCallback(() => {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    }, [currentPage, goToPage, totalPages]);

    const renderPageNumbers = useMemo(() => generatePageNumbers(currentPage, totalPages, goToPage), [currentPage, goToPage, totalPages]);

    if (totalPages === 0) {
        return null;
    }

    return (
        <div className="flex h-full items-center justify-center">
            <ArrowLeft onClick={goToPreviousPage} disabled={currentPage === 1} />
            <div className="flex hidden items-center justify-center md:flex">{renderPageNumbers.md}</div>
            <div className="flex items-center justify-center md:hidden">{renderPageNumbers.sm}</div>
            <ArrowRight onClick={goToNextPage} disabled={currentPage === totalPages} />
        </div>
    );
};

export default PaginationControls;
