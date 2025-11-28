import {
    Loader,
    LoaderVariant,
    Tooltip,
    TooltipPlacement,
} from '@zinnia/bloom/components';
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
        TaskStatus.Scheduled,
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

    const triggerClassName = '!z-10  justify-end';
    const assigneePopoverBtnClassName =
        'w-full flex items-center space-x-2 py-1.5 z-10';

    return (
        <div className="w-full relative block" ref={popoverRef}>
            {hasAssignee() ? (
                <button
                    ref={buttonRef}
                    type="button"
                    className={`${assigneePopoverBtnClassName} ${
                        task?.status === TaskStatus.Completed
                            ? styles.assigneeBtnCompletedTask
                            : ''
                    }`}
                    onClick={handlePopoverToggle}
                    aria-label="Open assignee popover"
                >
                    <Avatar
                        className="!mr-0"
                        name={assignee || ''}
                        size="small"
                    />
                    <Content
                        className="!z-10 !ml-0 min-h-8"
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
                            tooltipClassName="!w-auto"
                            triggerClassName={triggerClassName}
                            trigger={
                                <IconButton
                                    aria-label="Unassign"
                                    className="text-secondary"
                                    onClick={handleUnassignClick}
                                >
                                    <CancelIcon height={18} width={18} />
                                </IconButton>
                            }
                        >
                            <span className="text-md">Unassign</span>
                        </Tooltip>
                    )}
                </button>
            ) : (
                <div className="w-full flex justify-between !cursor-default">
                    <Content
                        contentClassName="text-sm !cursor-default"
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
                    >
                        <Content
                            className={
                                task?.status === TaskStatus.Completed
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
                    className={`absolute left-0 ${
                        showAbove ? 'bottom-full mb-2' : 'top-full mt-2'
                    } !z-[201] w-72
                        bg-white rounded-lg shadow-lg`}
                >
                    <div className="p-2 border-b">
                        <input
                            disabled={false}
                            onChange={handleSearchInputChange}
                            value={searchValue}
                            type="text"
                            placeholder="Find a person"
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-gray-300 text-gray-500"
                        />
                    </div>
                    <div className="max-h-[8rem] overflow-y-auto">
                        {assigneeLoading ? (
                            <div className="w-full h-10 text-center py-4">
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
                                    className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-100"
                                >
                                    <Avatar name={assignee.user} size="small" />
                                    <span className="text-gray-800">
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
