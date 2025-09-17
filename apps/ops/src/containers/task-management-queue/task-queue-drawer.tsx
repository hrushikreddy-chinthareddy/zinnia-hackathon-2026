import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import xss from 'xss';

import Button, {
    ButtonSize,
    ButtonType,
    ButtonVariant,
} from '@deps/components/button/button';
import Field, { FieldSize, FieldType } from '@deps/components/fields/field';
import FieldDateSelect from '@deps/components/fields/field-date-select/field-date-select';
import CustomLoader from '@deps/components/loader/customLoader';
import SelectSimple from '@deps/components/select/select';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { PendingReasonOptions } from '@deps/models/case/enums';
import { TaskSource, TaskType } from '@deps/models/case/task';
import {
    TaskQueueDrawerProps,
    TaskStatus,
} from '@deps/models/case/task-instance';
import { ERROR_CODES } from '@deps/pages/create-case/error';
import { getTaskInstance, updateTask } from '@deps/queries/api/v2/task';
import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { removeFromCache } from '@deps/utils/cache';

import GlobalTaskSideSheet from '../../components/side-sheet/task-details-sidesheet/global-task-sidesheet-content';

dayjs.extend(utc);

function TaskQueueDrawer({
    taskId,
    taskStatus,
    getTasks,
    taskDescription,
    taskName,
}: TaskQueueDrawerProps) {
    const tomorrow = dayjs().add(1, 'day').format('MMDDYYYY');
    const [date, setDate] = useState(tomorrow);
    const [startLoader, setStartLoader] = useState(false);
    const [timer] = useState(performance.now());
    const [pendingReason, setPendingReason] = useState('');
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: '' });
    const [notes, setNotes] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();
    const sideSheet = useSideSheetContext();
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDate(e.target.value);
    };
    const handleReasonChange = (val: string) => {
        setPendingReason(val);
    };

    const isSupportTicketRaised =
        pendingReason === PendingReasonOptions.SupportTicketRaised;

    const pendingReasonOptions = [
        {
            value: PendingReasonOptions.AwaitingAdditionalInformation,
            label: t(
                'taskManagementQueue.updateTaskStatusDrawer.pendingReasonOptions.awaitingAdditionalInformation'
            ),
        },
        {
            value: PendingReasonOptions.AwaitingApproval,
            label: t(
                'taskManagementQueue.updateTaskStatusDrawer.pendingReasonOptions.awaitingApproval'
            ),
        },
        {
            value: PendingReasonOptions.AwaitingApplication,
            label: t(
                'taskManagementQueue.updateTaskStatusDrawer.pendingReasonOptions.awaitingApplication'
            ),
        },
        {
            value: PendingReasonOptions.SupportTicketRaised,
            label: t(
                'taskManagementQueue.updateTaskStatusDrawer.pendingReasonOptions.supportTicketRaised'
            ),
        },
    ];

    const openGlobalSideSheet = () => {
        const content = (
            <GlobalTaskSideSheet
                taskId={taskId}
                taskDescription={taskDescription as TaskType}
            />
        );
        sideSheet.changeSideSheetContent(
            `${
                taskName
                    ? `${t('sideSheet.task.taskHeading')}: ${taskName}`
                    : t('sideSheet.task.taskHeading')
            }`,
            content
        );
        sideSheet.handleOpen(true);
    };

    const handleClose = () => {
        router.back();
    };
    const updateTaskStatus = async () => {
        if (isSupportTicketRaised && !notes) {
            setErrorMessage(
                t(
                    'taskManagementQueue.updateTaskStatusDrawer.errors.notesRequired'
                ) as string
            );
            return;
        }
        if (!taskId) {
            browserLogError('task-queue:handleStartTask::Missing taskId', {
                taskStatus: taskStatus,
            });
            router.push(
                `/create-case/error?errorCode=${ERROR_CODES.DATA_ENTRY_START_TASK_ERROR}`
            );
            return;
        }

        const taskData = await getTaskInstance({ taskId });
        try {
            setStartLoader(true);
            if (!taskData) {
                browserLogError(
                    'task-queue:handleStartTask::Error retrieving task data',
                    {
                        taskId: taskId,
                        taskStatus: taskStatus,
                    }
                );
                router.push(
                    `/create-case/error?errorCode=${ERROR_CODES.DATA_ENTRY_START_TASK_ERROR}`
                );
                return;
            }
            const formattedDate = dayjs
                .utc(date, NUMERIC_DATE_FORMAT)
                .toISOString();

            const body = {
                ...taskData,
                status: TaskStatus.Pending,
                source: TaskSource.ZinniaTaskManagement,
                scheduledReason: pendingReason,
                scheduledDate: formattedDate,
                data: {
                    ...taskData.data,
                    scheduledNote: notes,
                },
            };

            const response = await updateTask(
                taskData.caseId,
                taskData.id,
                body,
                timer
            );

            if (response) {
                browserLogInfo(
                    'task-queue:handleStartTask::Successfully updated task to in-progress',
                    {
                        taskId: taskData.id,
                        documentNumber: taskData?.data?.documentNumber,
                        clientCode: taskData?.carrier,
                        process: taskData?.process,
                    }
                );
                removeFromCache('getTaskInstance', { taskId: taskData.id });
                handleClose();
                getTasks && getTasks();
            } else {
                throw new Error('Failed to update task status.');
            }
        } catch (error) {
            console.log(error);
        } finally {
            setStartLoader(false);
        }
    };

    function handleIsDateAllowed(date: Dayjs): boolean {
        const currentDate = dayjs();
        if (date.isBefore(currentDate) || date.isSame(currentDate))
            return false;
        return true;
    }

    const handleCancel = () => {
        const currentLocation = window.location.pathname;
        const regex = /^\/cases\/CA\d+\/progress$/;
        if (regex.test(currentLocation)) {
            openGlobalSideSheet();
        } else {
            sideSheet.onClose();
        }
    };

    return (
        <div className="m-10 flex flex-col gap-5">
            <Typography variant={TypographyVariant.H4}>
                {t(
                    `${'taskManagementQueue.updateTaskStatusDrawer.setTaskAsPending'}`
                )}
            </Typography>
            <FieldDateSelect
                label={
                    t(
                        `taskManagementQueue.updateTaskStatusDrawer.followUpDate`
                    ) as string
                }
                onChange={handleDateChange}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                value={date}
                isFutureDateDisabled={false}
                isDateAllowed={(date) => handleIsDateAllowed(date)}
            />
            <SelectSimple
                className="max-w-lg placeholder:text-gray-400"
                label={
                    t(
                        'taskManagementQueue.updateTaskStatusDrawer.reason'
                    ) as string
                }
                options={pendingReasonOptions}
                onChange={handleReasonChange}
                size={FieldSize.Small}
                placeholder={
                    t(
                        'taskManagementQueue.updateTaskStatusDrawer.selectReason'
                    ) as string
                }
                value={pendingReason}
                name="form-type"
            />

            {isSupportTicketRaised && (
                <Field
                    required={true}
                    label={
                        t(
                            `taskManagementQueue.updateTaskStatusDrawer.notes`
                        ) as string
                    }
                    message={errorMessage}
                    onChange={(e) => setNotes(xss(e.target.value))}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={notes}
                    data-testid="notes"
                />
            )}

            <div className="flex justify-end align-middle">
                <Button
                    className="mr-4"
                    onClick={handleCancel}
                    size={ButtonSize.Small}
                    type={ButtonType.Secondary}
                >
                    {t('cancel')}
                </Button>

                <Button
                    className="mr-4"
                    onClick={updateTaskStatus}
                    size={startLoader ? ButtonSize.Default : ButtonSize.Small}
                    variant={
                        !pendingReason ||
                        !date ||
                        (isSupportTicketRaised && !notes)
                            ? ButtonVariant.Inactive
                            : ButtonVariant.Default
                    }
                    disabled={
                        !pendingReason ||
                        !date ||
                        (isSupportTicketRaised && !notes)
                    }
                    aria-label={
                        t(
                            'taskManagementQueue.updateTaskStatusDrawer.updateStatus'
                        ) as string
                    }
                    type={ButtonType.Primary}
                >
                    {!startLoader ? (
                        t(
                            'taskManagementQueue.updateTaskStatusDrawer.updateStatus'
                        )
                    ) : (
                        <CustomLoader />
                    )}
                </Button>
            </div>
        </div>
    );
}

export default TaskQueueDrawer;
