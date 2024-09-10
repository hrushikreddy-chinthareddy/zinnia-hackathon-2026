import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import React, { useContext, useRef } from 'react';

import ChipStatus from '@deps/components/chip-status/chip-status';
import Popover, { PopoverPlacement } from '@deps/components/popover/popover';
import Tooltip from '@deps/components/tooltip/tooltip';
import CaseOverviewNavDrawerTooltip, {
    CaseOverviewNavDrawerTitle,
} from '@deps/containers/case-overview-nav-drawer-tooltip/case-overview-nav-drawer-tooltip';
import { CASE_OVERVIEW_TEXT, CaseOverviewNavDrawerContext } from '@deps/contexts/CaseOverviewNavDrawer';
import { useOutsideClick } from '@deps/hooks/useOutsideClick';
import { getStatusAccentColor, getStatusIcon } from '@deps/hooks/useStatusInfo';
import { Statuses } from '@deps/models/case/case';
import { StageInstance } from '@deps/models/case/stage-instance';
import { ReactComponent as ArrowMd } from '@deps/styles/elements/icons/arrow/arrow-md.svg';
import { ReactComponent as ChevronDown } from '@deps/styles/elements/icons/arrow/chevron-down.svg';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';

interface StatusRowProps {
    status: Statuses;
    label: string;
    isSelected: boolean;
    onClick: (label: string) => void;
    handleOverlayClose?: () => void;
}

const OpenStatusRow = ({ status, label, isSelected, handleOverlayClose, onClick }: StatusRowProps) => {
    const classes = clsx('default-focus flex w-full items-center rounded p-2', {
        'cursor-not-allowed bg-white': isSelected,
        'cursor-pointer hover:bg-gray-800': !isSelected,
    });

    return (
        <div className="w-full">
            <div
                className={classes}
                tabIndex={0}
                role="button"
                aria-disabled={isSelected}
                onKeyDown={e => {
                    if (isSelected) return;

                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault(); // Prevent scrolling when pressing Spacebar

                        if (onClick) {
                            onClick(label);
                            handleOverlayClose?.();
                        }
                    }
                }}
                onClick={() => {
                    if (isSelected) return;

                    onClick(label);

                    handleOverlayClose?.();
                }}
            >
                <div className="w-auto">
                    <ChipStatus status={status} />
                </div>

                <span
                    className={`ml-4 max-w-140 overflow-hidden text-ellipsis whitespace-nowrap font-primary text-md ${
                        isSelected ? 'font-medium text-gray-900' : 'font-light text-white'
                    }`}
                >
                    {label}
                </span>

                {!isSelected && <ChevronDown className="ml-auto mr-3 h-3 w-3 rotate-270 transform text-white" />}
            </div>
        </div>
    );
};

const ClosedStatusRow = ({ status, label, isSelected, onClick }: StatusRowProps) => {
    const { t } = useTranslation();

    const classes = clsx('flex h-8 w-8 justify-center rounded px-3.5 py-1', {
        'bg-white': isSelected,
        'hover:bg-gray-800': !isSelected,
    });

    return (
        <div className="align-center my-4 flex w-full justify-center">
            <Tooltip placement={PopoverPlacement.BottomRight} body={label} popoverClassName="!rounded !bg-gray-800" isTabbable={false}>
                <div className={classes}>
                    <div
                        className={`h-6 w-6 rounded-full border-2 border-${getStatusAccentColor(status)} text-${getStatusAccentColor(
                            status
                        )} default-focus flex flex-shrink-0 items-center justify-center bg-white`}
                        tabIndex={0}
                        role="button"
                        aria-label={label}
                        aria-disabled={isSelected}
                        onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault(); // Prevent scrolling when pressing Spacebar

                                if (onClick) {
                                    onClick(label);
                                }
                            }
                        }}
                        onClick={() => {
                            if (isSelected) return;

                            onClick(label);
                        }}
                    >
                        {getStatusIcon(t, status, 14, 14)}
                    </div>
                </div>
            </Tooltip>
        </div>
    );
};

export interface CaseOverviewNavDrawerProps {
    caseStatus: Statuses;
    stages: StageInstance[];
    isNavDrawerOpen: boolean;
    setIsOpenOverride: (isOpen: boolean) => void;
    shouldOverlay: boolean;
}

const CaseOverviewNavDrawer: React.FC<CaseOverviewNavDrawerProps> = ({
    caseStatus,
    stages,
    isNavDrawerOpen,
    shouldOverlay,
    setIsOpenOverride,
}) => {
    const { t } = useTranslation();
    const [selectedNavItem, setSelectedNavItem] = useContext(CaseOverviewNavDrawerContext);

    // Only close on outside click while in overlay mode and the the nav drawer is open.
    // Also called when clicking items in the nav drawer while its open and shouldOverlay is true
    const handleOverlayClose = () => {
        if (shouldOverlay && isNavDrawerOpen) {
            setIsOpenOverride(false);
        }
    };

    const containerRef = useRef<HTMLDivElement>(null);
    useOutsideClick(containerRef, isNavDrawerOpen, handleOverlayClose);

    const navbarContainerClass = clsx(
        'z-10 flex-shrink-0 flex-col overflow-visible bg-gray-900 pt-2 transition-all duration-200 ease-in-out',
        {
            'w-85 flex-grow p-6': isNavDrawerOpen,
            'w-[52px] pt-2': !isNavDrawerOpen,
        }
    );

    return (
        <div className={navbarContainerClass} ref={containerRef}>
            {isNavDrawerOpen ? (
                <div className="flex w-full items-center justify-end">
                    <button
                        onClick={() => setIsOpenOverride(!isNavDrawerOpen)}
                        aria-label={t('sidenav.collapse') as string}
                        className="default-focus my-4 flex items-center justify-center rounded text-white"
                    >
                        <ArrowMd width={9.6} height={8} className="simple-transition flex flex-col text-white" />
                        <span className="ml-2 flex flex-col font-primary text-links-sm font-semibold">{t('sidenav.collapse')}</span>
                    </button>
                </div>
            ) : (
                <div className="flex w-full items-center justify-center">
                    <button
                        onClick={() => setIsOpenOverride(!isNavDrawerOpen)}
                        aria-label={t('sidenav.expand') as string}
                        className="default-focus mb-6 mt-2 flex h-[32px] w-[32px] items-center justify-center rounded bg-gray-800 text-white"
                    >
                        <ArrowMd width={9.6} height={8} className="simple-transition flip180 text-white" />
                    </button>
                </div>
            )}

            <div className={clsx('flex w-full items-center', { 'mx-auto w-max': !isNavDrawerOpen })}>
                {isNavDrawerOpen ? (
                    <OpenStatusRow
                        status={caseStatus}
                        label={t('caseOverview.headerText')}
                        isSelected={selectedNavItem === CASE_OVERVIEW_TEXT}
                        onClick={() => setSelectedNavItem(CASE_OVERVIEW_TEXT)}
                        handleOverlayClose={handleOverlayClose}
                    />
                ) : (
                    <ClosedStatusRow
                        status={caseStatus}
                        label={t('caseOverview.headerText')}
                        isSelected={selectedNavItem === CASE_OVERVIEW_TEXT}
                        onClick={() => setSelectedNavItem(CASE_OVERVIEW_TEXT)}
                    />
                )}
            </div>

            {isNavDrawerOpen && (
                <div className="flex items-center gap-6 pt-8 text-sm font-bold text-white">
                    <span className="flex items-center gap-2">
                        <span className="mr-1 font-primary text-field-label font-bold">{t('caseOverview.navDrawer.topStatus')}</span>
                        <Popover
                            placement={PopoverPlacement.BottomRight}
                            title={<CaseOverviewNavDrawerTitle />}
                            body={<CaseOverviewNavDrawerTooltip />}
                            popoverClassName="!rounded !bg-gray-800"
                        >
                            <span className="block p-[4px]">
                                <CircleInfoIcon height={'16px'} width={'16px'} className="text-primary" />
                            </span>
                        </Popover>
                    </span>
                    <span className="font-primary text-field-label font-bold" data-testid="case-overview-top-status">{t('caseOverview.navDrawer.stage')}</span>
                </div>
            )}

            <hr className={`h-0.5 w-full border-gray-800 ${isNavDrawerOpen ? 'mt-2' : 'mt-8'}`} />

            <div className="flex w-full flex-col">
                {stages.map(stage => (
                    <div className={isNavDrawerOpen ? 'mt-6' : 'mx-auto'} key={stage.label}>
                        {isNavDrawerOpen ? (
                            <OpenStatusRow
                                status={stage.stageStatus}
                                label={stage.label}
                                isSelected={selectedNavItem === stage.label}
                                onClick={setSelectedNavItem}
                                handleOverlayClose={handleOverlayClose}
                            />
                        ) : (
                            <ClosedStatusRow
                                status={stage.stageStatus}
                                label={stage.label}
                                isSelected={selectedNavItem === stage.label}
                                onClick={setSelectedNavItem}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CaseOverviewNavDrawer;
