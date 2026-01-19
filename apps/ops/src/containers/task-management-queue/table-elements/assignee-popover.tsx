import {
    Loader,
    LoaderVariant,
    Tooltip,
    TooltipPlacement,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import React, {
    useRef,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';

import Avatar from '@deps/components/avatar/avatar';
import Content, { ContentVariant } from '@deps/components/content/content';
import IconButton from '@deps/components/icon-button/icon-button';
import { TranslationFiles } from '@deps/config/translations';
import {
    AssignedTask,
    ManagementTask,
    TaskStatus,
    UnassignedTask,
} from '@deps/models/case/task-instance';
import { ReactComponent as CancelIcon } from '@deps/styles/elements/icons/actions/cancel.svg';

import styles from './assignee-popover.module.css';
import { stopPropagation } from '../task-queue-utils';

export function useOnClickOutside(
    ref: React.RefObject<HTMLElement>,
    handler: (event: MouseEvent | TouchEvent) => void
) {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler(event);
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
}

type Assignee = {
    partyId: string;
    user: string;
};

export enum AssigneePopoverPositionMode {
    Table = 'table',
    Portal = 'portal',
}

export type AssigneePopoverProps = {
    assignee?: string;
    assigneeList: Assignee[];
    assigneeLoading: boolean;
    actionLoader: boolean;

    searchValue: string;

    task: AssignedTask | UnassignedTask | ManagementTask;

    isOpen: boolean;
    positionMode?:
        | AssigneePopoverPositionMode.Table
        | AssigneePopoverPositionMode.Portal;

    hasAssignee: () => boolean;

    handleClick: () => void;
    onOpen: () => void;
    onClose: () => void;

    handleSearch: (value: string) => void;

    handleTaskAssignAsAdmin: (taskId: string, assigneePartyId: string) => void;

    handleTaskUnassignAsAdmin: (
        taskId: string,
        assigneePartyId: string
    ) => void;
};

const AssigneePopover = (props: AssigneePopoverProps) => {
    const {
        assignee,
        assigneeList,
        assigneeLoading,
        actionLoader,
        searchValue,
        handleClick,
        handleSearch,
        handleTaskAssignAsAdmin,
        handleTaskUnassignAsAdmin,
        hasAssignee,
        task,
        isOpen,
        onOpen,
        onClose,
        positionMode,
    } = props;

    const POPOVER_HEIGHT = 170;
    const POPOVER_WIDTH = 288; // 18rem
    const VIEWPORT_PADDING = 8;
    const TBODY = 'tbody';

    const [showAbove, setShowAbove] = useState(false);
    const [positionReady, setPositionReady] = useState(false);
    const [resolvedMode, setResolvedMode] = useState<'table' | 'portal'>(
        positionMode ?? 'table'
    );

    const modeDecidedRef = useRef(false);

    const buttonRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'taskManagementQueue',
    });

    const handleSafeClose = useCallback(() => {
        handleSearch('');
        onClose();
    }, [handleSearch, onClose]);

    useOnClickOutside(popoverRef, () => isOpen && handleSafeClose());

    /**
     * Decide render mode (inside table vs portal) +
     * compute "showAbove" flag
     */
    useEffect(() => {
        if (!isOpen || !buttonRef.current) return;

        // Decide only ONCE per open cycle
        if (modeDecidedRef.current) return;
        modeDecidedRef.current = true;

        const triggerRect = buttonRef.current.getBoundingClientRect();
        const tbody = buttonRef.current.closest(TBODY);

        let spaceBelow = 0;

        if (tbody) {
            const tbodyRect = tbody.getBoundingClientRect();
            spaceBelow = tbodyRect.bottom - triggerRect.bottom;
        } else {
            spaceBelow = window.innerHeight - triggerRect.bottom;
        }

        const shouldPortal =
            positionMode === 'portal' || spaceBelow < POPOVER_HEIGHT;

        setResolvedMode(
            shouldPortal
                ? AssigneePopoverPositionMode.Portal
                : AssigneePopoverPositionMode.Table
        );
        setShowAbove(spaceBelow < POPOVER_HEIGHT);
        setPositionReady(true);
    }, [isOpen, positionMode]);

    useEffect(() => {
        if (!isOpen) {
            modeDecidedRef.current = false;
            setPositionReady(false);
            setResolvedMode(positionMode ?? AssigneePopoverPositionMode.Table);
            setShowAbove(false);
        }
    }, [isOpen, positionMode]);

    /**
     * Assign selection
     */
    const handleAssigneeSelect = useCallback(
        (e: React.MouseEvent, selected: string, current?: string) => {
            if (selected === current) return;
            e.preventDefault();
            handleTaskAssignAsAdmin(task?.id, selected);
            handleSafeClose();
        },
        [task, handleTaskAssignAsAdmin, handleSafeClose]
    );

    const notAllowedStatuses = [
        TaskStatus.Completed,
        TaskStatus.Canceled,
        TaskStatus.Closed,
    ];

    const isPopoverAllowed = !notAllowedStatuses.includes(task.status);

    const togglePopover = useCallback(() => {
        if (!isPopoverAllowed) return;
        isOpen ? handleSafeClose() : onOpen();
        handleClick();
    }, [isOpen, isPopoverAllowed, onOpen, handleSafeClose, handleClick]);

    const handleUnassignClick = useCallback(
        (e: React.MouseEvent) => {
            if (task?.status === TaskStatus.Completed) return;
            e.preventDefault();
            stopPropagation(e);
            handleTaskUnassignAsAdmin(
                task?.id,
                task?.assigneePartyId as string
            );
        },
        [task, handleTaskUnassignAsAdmin]
    );

    const handleSearchInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) =>
            handleSearch(e.target.value),
        [handleSearch]
    );

    const onAssigneeClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>, partyId: string) => {
            stopPropagation(e);

            handleAssigneeSelect(e, partyId, task?.assigneePartyId);
        },
        [handleAssigneeSelect, task?.assigneePartyId]
    );

    /**
     * ---------- Popover Content ----------
     */
    const renderPopoverContent = (): ReactNode => (
        <div
            className={styles.popover}
            ref={popoverRef}
            onClick={(e) => stopPropagation(e)}
            onMouseDown={(e) => stopPropagation(e)}
            onKeyDown={(e) => stopPropagation(e)}
        >
            <div className={styles.searchBar}>
                <input
                    onChange={handleSearchInput}
                    value={searchValue}
                    type="text"
                    placeholder={t('assigneeSearchPlaceholder') || ''}
                    className={styles.searchInput}
                    onClick={(e) => stopPropagation(e)}
                    onMouseDown={(e) => stopPropagation(e)}
                    onKeyDown={(e) => stopPropagation(e)}
                />
            </div>

            <div className={styles.listContainer}>
                {assigneeLoading || actionLoader ? (
                    <div className={styles.loaderWrapper}>
                        <Loader variant={LoaderVariant.CTA} />
                    </div>
                ) : (
                    assigneeList.map((a: Assignee) => (
                        <button
                            key={a.partyId}
                            className={styles.assigneeRow}
                            onClick={(e) => onAssigneeClick(e, a.partyId)}
                        >
                            <Avatar name={a.user} size="small" />
                            <span className={styles.assigneeName}>
                                {a.user}
                            </span>
                        </button>
                    ))
                )}
            </div>
        </div>
    );

    /**
     * ---------- Portal Positioning ----------
     */
    const [portalPos, setPortalPos] = useState<{ left: number; top: number }>();

    const computePortalPosition = useCallback(() => {
        if (!buttonRef.current) return;

        requestAnimationFrame(() => {
            const rect = buttonRef.current!.getBoundingClientRect();

            const viewportWidth = window.innerWidth;

            let left: number;

            // Prefer left-align
            left = rect.left;

            // If overflow right → right-align with trigger
            if (left + POPOVER_WIDTH > viewportWidth - VIEWPORT_PADDING) {
                left = rect.right - POPOVER_WIDTH;
            }

            // Final safety clamp
            left = Math.max(
                VIEWPORT_PADDING,
                Math.min(left, viewportWidth - POPOVER_WIDTH - VIEWPORT_PADDING)
            );

            setPortalPos({
                left,
                top: showAbove
                    ? rect.top - POPOVER_HEIGHT - VIEWPORT_PADDING
                    : rect.bottom + VIEWPORT_PADDING,
            });
        });
    }, [showAbove]);

    useEffect(() => {
        if (isOpen && resolvedMode === 'portal') {
            computePortalPosition();
        }
    }, [isOpen, resolvedMode, computePortalPosition]);

    const renderPortalPopover = () =>
        portalPos &&
        ReactDOM.createPortal(
            <div
                className={clsx(
                    styles.popoverPortalWrapper,
                    showAbove ? styles.portalAbove : styles.portalBelow
                )}
                style={portalPos}
            >
                {renderPopoverContent()}
            </div>,
            document.body
        );

    /**
     * ---------- UI ----------
     */
    return (
        <div className="w-full relative block">
            {hasAssignee() ? (
                <button
                    ref={buttonRef}
                    type="button"
                    className={clsx(
                        styles.assigneeButton,
                        (task?.status === TaskStatus.Completed ||
                            task?.status === TaskStatus.Canceled) &&
                            styles.assigneeBtnCompletedTask
                    )}
                    onClick={togglePopover}
                >
                    <Avatar name={assignee || ''} size="small" />

                    <Content
                        className={styles.assigneeContent}
                        contentClassName="text-left flex-1"
                        details={
                            assignee
                                ?.split(',')
                                .map((x: string) => x.trim())
                                .reverse()
                                .join(' ') || ''
                        }
                        variant={ContentVariant.BodySm}
                    />

                    {isPopoverAllowed && (
                        <Tooltip
                            placement={TooltipPlacement.TopRight}
                            tooltipClassName={styles.tooltip}
                            triggerClassName={styles.tooltipTrigger}
                            trigger={
                                <IconButton
                                    aria-label="Unassign"
                                    className={styles.unassignBtn}
                                    onClick={handleUnassignClick}
                                >
                                    <CancelIcon height={18} width={18} />
                                </IconButton>
                            }
                        >
                            <span className={styles.tooltipText}>Unassign</span>
                        </Tooltip>
                    )}
                </button>
            ) : (
                <div
                    className={
                        positionMode === 'portal'
                            ? styles.assigneeInlinePortal
                            : styles.assigneeInline
                    }
                >
                    <Content
                        contentClassName={styles.inlineContent}
                        details={assignee}
                        variant={ContentVariant.ArticleReferences}
                    />

                    <button
                        ref={buttonRef}
                        type="button"
                        onClick={togglePopover}
                        className={styles.assignButton}
                    >
                        <Content
                            className={
                                task?.status === TaskStatus.Completed ||
                                task?.status === TaskStatus.Canceled
                                    ? styles.completed
                                    : styles.active
                            }
                            details={t('assign') || ''}
                            variant={ContentVariant.BodySm}
                        />
                    </button>
                </div>
            )}

            {isOpen &&
                positionReady &&
                (resolvedMode === 'portal'
                    ? renderPortalPopover()
                    : renderPopoverContent())}
        </div>
    );
};

export default AssigneePopover;
