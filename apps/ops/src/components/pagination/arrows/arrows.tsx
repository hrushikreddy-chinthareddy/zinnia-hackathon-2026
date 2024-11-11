import React from 'react';

import { ReactComponent as ChevronDown } from '@deps/styles/elements/icons/arrow/chevron-down.svg';

export enum ArrowDirections {
    Left = 'left',
    Right = 'right',
}

interface ArrowProps {
    direction: ArrowDirections;
    disabled: boolean;
    selected?: boolean;
    onClick: () => void;
}

export interface PaginationArrowProps {
    disabled: boolean;
    onClick: () => void;
}

const handleKeyDown = (e: React.KeyboardEvent, onClick: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); // Prevent scrolling when pressing Spacebar

        if (onClick) {
            onClick();
        }
    }
};

function Arrow({ direction, disabled, selected, onClick }: ArrowProps) {
    const hoverClass = 'hover:bg-secondary-lightest hover:border-transparent hover:outline-transparent';
    const selectedClass = selected ? 'outline-2 bg-secondary-light' : '';
    const disabledClass = disabled ? 'pointer-events-none bg-gray-100 !border-gray-300 !outline-gray-300 text-gray-300' : 'text-secondary';
    const focusBorderClasses =
        'relative focus-visible:before:border-2 focus-visible:before:border-semantic-focus focus-visible:before:z-20 focus-visible:before:rounded';
    const focusSpacingClasses = 'focus-visible:before:absolute focus-visible:before:inset-[-2px] focus-visible:before:-m-2';
    const classes = `border-1 border-secondary outline outline-offset-0 outline-1 outline-secondary bg-transparent
        ${hoverClass} ${selectedClass} ${disabledClass} ${focusBorderClasses} ${focusSpacingClasses}`;

    return (
        <button
            className={`mx-1 flex !h-8 !w-8 items-center justify-center rounded outline-none ${classes}`}
            onClick={() => !disabled && onClick()}
            data-testid={`arrow-${direction}`}
            id={`pagination-arrow-${direction}`}
            aria-label="Pagination"
            role="navigation"
            tabIndex={disabled ? -1 : 0}
            onKeyDown={e => handleKeyDown(e, onClick)}
        >
            <ChevronDown className={`h-5 w-5 transform ${direction === ArrowDirections.Left ? 'rotate-90' : 'rotate-270'}`} />
        </button>
    );
}

export const ArrowLeft: React.FC<PaginationArrowProps> = ({ disabled, onClick }) => (
    <Arrow direction={ArrowDirections.Left} disabled={disabled} onClick={onClick} />
);

export const ArrowRight: React.FC<PaginationArrowProps> = ({ disabled, onClick }) => (
    <Arrow direction={ArrowDirections.Right} disabled={disabled} onClick={onClick} />
);
