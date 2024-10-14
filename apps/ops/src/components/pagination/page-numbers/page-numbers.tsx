import React from 'react';

export interface PageNumberProps {
    pageNumber: number;
    currentPage: number;
    onClick: (pageNumber: number) => void;
}

const handleKeyDown = (e: React.KeyboardEvent, onClick: (pageNumber: number) => void, pageNumber: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); // Prevent scrolling when pressing Spacebar

        if (onClick) {
            onClick(pageNumber);
        }
    }
};

const PageNumber: React.FC<PageNumberProps> = ({ pageNumber, currentPage, onClick }) => {
    const isSelected = pageNumber === currentPage;

    const hoverClass = 'hover:bg-secondary-lightest';
    const selectedClass = isSelected
        ? 'border-2 !outline-secondary outline-offset-0 !bg-secondary-lightest !border-secondary pointer-events-none rounded-[3px]'
        : 'cursor-pointer';
    const focusBorderClasses =
        'relative focus-visible:before:border-2 focus-visible:before:border-semantic-focus focus-visible:before:z-20 focus-visible:before:rounded';
    const focusSpacingClasses = 'focus-visible:before:absolute focus-visible:before:inset-[6px] focus-visible:before:-m-2';
    const activeClass = 'active:font-semibold';

    const classes = `border-0 outline-0 bg-transparent
        ${hoverClass} ${selectedClass} ${focusBorderClasses} ${focusSpacingClasses} ${activeClass}`;

    return (
        <button
            className={`mx-1 inline-flex h-8 w-7.5 select-none items-center justify-center rounded px-3 text-label-lg font-medium text-secondary ${classes}`}
            onClick={() => !isSelected && onClick(pageNumber)}
            onKeyDown={e => handleKeyDown(e, onClick, pageNumber)}
            disabled={isSelected}
            aria-label={`Page ${pageNumber}`}
            tabIndex={isSelected ? -1 : 0}
            aria-current={isSelected ? 'page' : undefined}
            data-testid="page-number"
        >
            <span className="flex justify-center">{pageNumber}</span>
        </button>
    );
};

export default PageNumber;
