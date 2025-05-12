import { Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import React from 'react';

import styles from '../pagination.module.css';

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
    const ariaLabel = () => {
        return direction === ArrowDirections.Left ? 'Paginate back' : 'Paginate forward';
    };

    return (
        <button
            className={clsx(styles.paginationItem, selected && styles.selected)}
            onClick={() => !disabled && onClick()}
            data-testid={`arrow-${direction}`}
            id={`pagination-arrow-${direction}`}
            aria-label={ariaLabel()}
            role="navigation"
            onKeyDown={e => handleKeyDown(e, onClick)}
            disabled={disabled}
        >
            <Icon
                type={IconType.CHEVRON}
                height={20}
                width={20}
                className={`transform ${direction === ArrowDirections.Left ? 'rotate-90' : 'rotate-270'}`}
            />
        </button>
    );
}

export const ArrowLeft: React.FC<PaginationArrowProps> = ({ disabled, onClick }) => (
    <Arrow direction={ArrowDirections.Left} disabled={disabled} onClick={onClick} />
);

export const ArrowRight: React.FC<PaginationArrowProps> = ({ disabled, onClick }) => (
    <Arrow direction={ArrowDirections.Right} disabled={disabled} onClick={onClick} />
);
