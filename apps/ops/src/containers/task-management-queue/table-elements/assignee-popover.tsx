import {
    Loader,
    LoaderVariant,
    Tooltip,
    TooltipPlacement,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Avatar from '@deps/components/avatar/avatar';
import Content, { ContentVariant } from '@deps/components/content/content';
import IconButton from '@deps/components/icon-button/icon-button';
import { TranslationFiles } from '@deps/config/translations';
import { TaskStatus } from '@deps/models/case/task-instance';
import { ReactComponent as CancelIcon } from '@deps/styles/elements/icons/actions/cancel.svg';

import styles from './assignee-popover.module.css';

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

const AssigneePopover = ({
    assignee,
    assigneeList,
    assigneeLoading,
    searchValue,
    handleClick,
    handleSearch,
    handleTaskAssignAsAdmin,
    handleTaskUnassignAsAdmin,
    hasAssignee,
    task,
    positionMode,
}: any) => {
    const POPOVER_HEIGHT = 170;
    const TBODY = 'tbody';

    const [open, setOpen] = useState(false);
    const [showAbove, setShowAbove] = useState(false);
    const [positionReady, setPositionReady] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'taskManagementQueue',
    });

    useOnClickOutside(popoverRef, () => setOpen(false));

    useEffect(() => {
        //Dynamically decide position of the popover
        if (open && buttonRef.current) {
            const triggerRect = buttonRef.current.getBoundingClientRect();
            const tbodyElement = buttonRef.current.closest(TBODY);
            const estimatedPopoverHeight = POPOVER_HEIGHT;

            if (tbodyElement) {
                const tbodyRect = tbodyElement.getBoundingClientRect();

                const spaceBelow = tbodyRect.bottom - triggerRect.bottom;
                const spaceAbove = triggerRect.top - tbodyRect.top;

                setShowAbove(
                    spaceBelow < estimatedPopoverHeight &&
                        spaceAbove > spaceBelow
                );
            } else {
                // fallback to window if tbody is not found
                const spaceBelow = window.innerHeight - triggerRect.bottom;
                const spaceAbove = triggerRect.top;

                setShowAbove(
                    spaceBelow < estimatedPopoverHeight &&
                        spaceAbove > spaceBelow
                );
            }
            setPositionReady(true);
        }
    }, [open]);

    useEffect(() => {
        if (!open) {
            setPositionReady(false);
        }
    }, [open]);

    const handleAssigneeSelectFromPopover = useCallback(
        (
            event: React.MouseEvent,
            taskId: string | undefined,
            currentAssigneeId: string | undefined,
            selectedAssigneeId: string
        ) => {
            if (selectedAssigneeId === currentAssigneeId) return;

            event.preventDefault();
            handleTaskAssignAsAdmin(taskId, selectedAssigneeId);
            setOpen(false);
        },
        [handleTaskAssignAsAdmin, setOpen]
    );

    const notAllowedStatuses = [
        TaskStatus.Completed,
        TaskStatus.Canceled,
        TaskStatus.Closed,
    ];
    const isPopoverAllowed = !notAllowedStatuses.includes(task.status);

    const handlePopoverToggle = useCallback(() => {
        if (isPopoverAllowed) {
            setOpen((prev) => !prev);
            handleClick();
        }
    }, [isPopoverAllowed, setOpen, handleClick]);

    const handleUnassignClick = useCallback(
        (e: React.MouseEvent) => {
            if (task?.status === TaskStatus.Completed) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            handleTaskUnassignAsAdmin(task?.id, task?.assigneePartyId);
        },
        [task, handleTaskUnassignAsAdmin]
    );

    const handleSearchInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            handleSearch(e.target.value);
        },
        [handleSearch]
    );

    return (
        <div className="w-full relative block" ref={popoverRef}>
            {hasAssignee() ? (
                <button
                    ref={buttonRef}
                    type="button"
                    className={clsx(
                        styles.assigneeButton,
                        (task?.status === TaskStatus.Completed ||
                            task?.status === TaskStatus.Canceled) &&
                            styles.assigneeBtnCompletedTask,
                        positionMode === 'portal'
                            ? styles.portalWidth70
                            : styles.fullWidth
                    )}
                    onClick={handlePopoverToggle}
                    aria-label="Open assignee popover"
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
                    ref={popoverRef}
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
                        tabIndex={
                            task?.status === TaskStatus.Completed ? -1 : 0
                        }
                        ref={buttonRef}
                        type="button"
                        onClick={handlePopoverToggle}
                        aria-label="Open assignee popover"
                        className={styles.assignButton}
                    >
                        <Content
                            className={
                                task?.status === TaskStatus.Completed ||
                                task?.status === TaskStatus.Canceled
                                    ? styles.completed
                                    : styles.active
                            }
                            details={t('assign') as string | undefined}
                            variant={ContentVariant.BodySm}
                        />
                    </button>
                </div>
            )}

            {open && positionReady && (
                <div
                    className={clsx(
                        styles.popover,
                        showAbove ? styles.popoverAbove : styles.popoverBelow
                    )}
                    ref={popoverRef}
                >
                    <div className={styles.searchBar}>
                        <input
                            disabled={false}
                            onChange={handleSearchInputChange}
                            value={searchValue}
                            type="text"
                            placeholder={t('assigneeSearchPlaceholder') || ''}
                            className={styles.searchInput}
                        />
                    </div>

                    <div className={styles.listContainer}>
                        {assigneeLoading || task.isAssigning ? (
                            <div className={styles.loaderWrapper}>
                                <Loader variant={LoaderVariant.CTA} />
                            </div>
                        ) : (
                            assigneeList.map((assignee: any) => (
                                <button
                                    key={assignee.partyId}
                                    onClick={(event) =>
                                        handleAssigneeSelectFromPopover(
                                            event,
                                            task?.id,
                                            task?.assigneePartyId,
                                            assignee.partyId
                                        )
                                    }
                                    className={styles.assigneeRow}
                                >
                                    <Avatar name={assignee.user} size="small" />
                                    <span className={styles.assigneeName}>
                                        {assignee.user}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssigneePopover;
