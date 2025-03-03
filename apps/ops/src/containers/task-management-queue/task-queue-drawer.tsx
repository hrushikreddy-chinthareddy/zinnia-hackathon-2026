import { FieldSize, FieldType } from "@deps/components/fields/field";
import FieldDateSelect from "@deps/components/fields/field-date-select/field-date-select";
import Typography, { TypographyVariant } from "@deps/components/typography/typography";
import { TranslationFiles } from "@deps/config/translations";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Button, { ButtonSize, ButtonType, ButtonVariant } from '@deps/components/button/button';
import SelectSimple from '@deps/components/select/select';
import { TaskStatus } from "@deps/models/case/task-instance";
import { getTaskInstance, updateTask } from "@deps/queries/api/v2/task";
import { browserLogError, browserLogInfo } from "@deps/utils/browser-logging";
import { useRouter } from "next/router";
import { TaskSource, TaskType } from "@deps/models/case/task";
import { ERROR_CODES } from "@deps/pages/create-case/error";
import { removeFromCache } from "@deps/utils/cache";
import { PendingReasonOptions } from "@deps/models/case/enums";
import { useSideSheetContext } from "@deps/contexts/SideSheetContext";
import GlobalTaskSideSheet from "../case-overview/tasks-table/sidesheet/global-task-sidesheet-content";
import { NUMERIC_DATE_FORMAT } from "@deps/types/constants";
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
function TaskQueueDrawer({ onClose, taskId, taskStatus, getTasks, taskDescription }: { onClose: () => void, getTasks?: () => void, taskStatus: TaskStatus, taskId: string, taskDescription?: string }) {
  const tomorrow = dayjs().add(1, 'day').format('MMDDYYYY');
  const [date, setDate] = useState(tomorrow)
  const [timer] = useState(performance.now());
  const [pendingReason, setPendingReason] = useState('')
  const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: '' });
  const TaskTitle: Record<string, string> = {
    [TaskType.SuitabilityReview]: t('caseOverview.tabs.suitabilityReviewIssues'),
  };
  const router = useRouter();
  const sideSheet = useSideSheetContext();
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };
  const handleReasonChange = (val: string) => {
    setPendingReason(val)
  }

  const pendingReasonOptions = [
    { value: PendingReasonOptions.AwaitingAdditionalInformation, label: t('taskManagementQueue.updateTaskStatusDrawer.pendingReasonOptions.awaitingAdditionalInformation') },
    {
      value: PendingReasonOptions.AwaitingApproval, label: t('taskManagementQueue.updateTaskStatusDrawer.pendingReasonOptions.awaitingApproval')
    },
    { value: PendingReasonOptions.AwaitingApplication, label: t('taskManagementQueue.updateTaskStatusDrawer.pendingReasonOptions.awaitingApplication') },
  ];



  const openGlobalSideSheet = () => {
    const content = <GlobalTaskSideSheet taskId={taskId} taskDescription={taskDescription as TaskType} />;
    sideSheet.changeSideSheetContent(`${t('sideSheet.task.taskHeading')}: ${TaskTitle[taskDescription as TaskType]}`, content);
    sideSheet.handleOpen(true);
  };
  const updateTaskStatus = async () => {
    if (!taskId) {
      browserLogError('task-queue:handleStartTask::Missing taskId', {
        taskStatus: taskStatus,
      });
      router.push(`/create-case/error?errorCode=${ERROR_CODES.DATA_ENTRY_START_TASK_ERROR}`);
      return;
    }

    const taskData = await getTaskInstance({ taskId });
    if (!taskData) {
      browserLogError('task-queue:handleStartTask::Error retrieving task data', {
        taskId: taskId,
        taskStatus: taskStatus,
      });
      router.push(`/create-case/error?errorCode=${ERROR_CODES.DATA_ENTRY_START_TASK_ERROR}`);
      return;
    }
    const formattedDate = dayjs.utc(date, NUMERIC_DATE_FORMAT).toISOString();

    try {
      const body = {
        ...taskData,
        status: TaskStatus.Pending,
        source: TaskSource.ZinniaTaskManagement,
        impededReason: pendingReason,
        impededTillDate: formattedDate
      };

      const response = await updateTask(taskData.caseId, taskData.id, body, timer);

      if (response) {
        browserLogInfo('task-queue:handleStartTask::Successfully updated task to in-progress', {
          taskId: taskData.id,
          documentNumber: taskData?.data?.documentNumber,
          clientCode: taskData?.carrier,
          process: taskData?.process,
        });
        removeFromCache('getTaskInstance', { taskId: taskData.id});
        onClose();
        getTasks && getTasks();

      } else {
        throw new Error('Failed to update task status.');
      }
    } catch (error) {
      console.log(error)
    }
  };
  function handleIsDateAllowed(date: Dayjs): boolean {
    const currentDate = dayjs()
    if (date.isBefore(currentDate) || date.isSame(currentDate)) return false
    return true
  }

  const handleCancel = () => {
    const currentLocation = window.location.pathname;
    const regex = /^\/cases\/CA\d+\/progress$/;
    if (regex.test(currentLocation)) {
      openGlobalSideSheet();
    } else {
      onClose();
    }
  }

  return (
    <div className="m-10 flex flex-col gap-5">
      <Typography variant={TypographyVariant.H4}>
        {t(`${'taskManagementQueue.updateTaskStatusDrawer.setTaskAsPending'}`)}
      </Typography>
      <FieldDateSelect
        label={(t(`taskManagementQueue.updateTaskStatusDrawer.followUpDate`) as string)}
        onChange={handleDateChange}
        size={FieldSize.Small}
        type={FieldType.BaseActive}
        value={date}
        isFutureDateDisabled={false}
        isDateAllowed={date => handleIsDateAllowed(date)}
      />
      <SelectSimple
        className="max-w-lg placeholder:text-gray-400"
        label={t('taskManagementQueue.updateTaskStatusDrawer.reason') as string}
        options={pendingReasonOptions}
        onChange={handleReasonChange}
        size={FieldSize.Small}
        placeholder={t('taskManagementQueue.updateTaskStatusDrawer.selectReason') as string}
        value={pendingReason}
        name="form-type"
      />

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
          size={ButtonSize.Small}
          variant={!pendingReason || !date ? ButtonVariant.Inactive : ButtonVariant.Default}
          disabled={!pendingReason || !date}
          type={ButtonType.Primary}
        >
          {t('taskManagementQueue.updateTaskStatusDrawer.updateStatus')}
        </Button>
      </div>

    </div>


  )
}

export default TaskQueueDrawer
