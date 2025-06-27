import clsx from 'clsx';
import React from 'react';

import styles from '../pagination.module.css';
export interface PageNumberProps {
    pageNumber: number;
    currentPage: number;
    onClick: (pageNumber: number) => void;
}

const handleKeyDown = (
    e: React.KeyboardEvent,
    onClick: (pageNumber: number) => void,
    pageNumber: number
) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); // Prevent scrolling when pressing Spacebar

        if (onClick) {
            onClick(pageNumber);
        }
    }
};

const PageNumber: React.FC<PageNumberProps> = ({
    pageNumber,
    currentPage,
    onClick,
}) => {
    const isSelected = pageNumber === currentPage;

    return (
        <button
            className={clsx(
                styles.paginationItem,
                styles.pageNumber,
                isSelected && styles.selected
            )}
            onClick={() => !isSelected && onClick(pageNumber)}
            onKeyDown={(e) => handleKeyDown(e, onClick, pageNumber)}
            aria-label={`Page ${pageNumber}`}
            aria-current={isSelected ? 'page' : undefined}
            data-testid="page-number"
        >
            {pageNumber}
        </button>
    );
};

export default PageNumber;
