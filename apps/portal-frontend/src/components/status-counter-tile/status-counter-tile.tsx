import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import React from 'react';

import ChipStatus from '@deps/components/chip-status/chip-status';
import { Statuses } from '@deps/models/case/case';

export interface StatusCounterTileProps {
    count: number;
    isActive?: boolean;
    isSelected?: boolean;
    onClick?: () => void;
    status?: Statuses;
}

const StatusCounterTile = ({ count, isActive = true, isSelected = false, onClick, status }: StatusCounterTileProps) => {
    const { t } = useTranslation();
    const countTypeUnits = t('caseManagementDashboard.statusFilters.cases');

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault(); // Prevent scrolling when pressing Spacebar

            if (isActive && onClick) {
                onClick();
            }
        }
    };

    const borderClass = clsx(`default-focus default-hover border-2 bg-white`, {
        'border-primary': isSelected,
        'border-transparent': !isSelected,
    });

    return (
        <div
            className={`h-full rounded-md p-4 shadow-md ${borderClass}`}
            data-testid="status-counter-tile"
            onClick={() => {
                if (isActive && onClick) {
                    onClick();
                }
            }}
            onKeyDown={handleKeyDown}
            role="button"
            aria-label={`Filter cases by: ${status ? `${status}` : t('caseManagementDashboard.statusFilters.all')}`}
            aria-pressed={isSelected}
            tabIndex={isActive ? 0 : -1}
        >
            <div className="flex flex-col items-center gap-2 text-center md:flex-row md:justify-between">
                <div className="font-primary text-label-lg font-semibold">
                    {status ? (
                        <div className="w-auto">
                            <ChipStatus status={status} />
                        </div>
                    ) : (
                        t('caseManagementDashboard.statusFilters.all')
                    )}
                </div>
                <div className="flex flex-col font-primary font-medium">
                    <div className="text-content-value">{count.toLocaleString()}</div>
                    <div className="text-content-caption">{countTypeUnits}</div>
                </div>
            </div>
        </div>
    );
};

export default StatusCounterTile;
