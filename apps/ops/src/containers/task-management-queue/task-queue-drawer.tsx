import { FieldSize, FieldType } from "@deps/components/fields/field";
import FieldDateSelect from "@deps/components/fields/field-date-select/field-date-select";
import Typography, { TypographyVariant } from "@deps/components/typography/typography";
import { TranslationFiles } from "@deps/config/translations";
import dayjs from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Button, { ButtonSize, ButtonType, ButtonVariant } from '@deps/components/button/button';
import SelectSimple from '@deps/components/select/select';
import { TaskStatus } from "@deps/models/case/task-instance";
import { getTaskInstance, updateTask } from "@deps/queries/api/v2/task";
import { browserLogError, browserLogInfo } from "@deps/utils/browser-logging";
import { useRouter } from "next/router";
import { TaskSource } from "@deps/models/case/task";
import { ERROR_CODES } from "@deps/pages/create-case/error";
function TaskQueueDrawer({ onClose, taskId, taskStatus, getTasks }: { onClose: () => void, getTasks?: () => void, taskStatus: TaskStatus, taskId: string }) {
  const tomorrow = dayjs().add(1, 'day').format('MMDDYYYY');
  const [date, setDate] = useState(tomorrow)
  const [timer] = useState(performance.now());
  const [pendingReason, setPendingReason] = useState('')
  const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'taskManagementQueue.updateTaskStatusDrawer' });
  const router = useRouter();
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };
  const handleReasonChange = (val: string) => {
    setPendingReason(val)
  }

  const pendingReasonOptions = [
    { value: 'Awaiting additional information ', label: 'Awaiting additional information' },
    { value: 'Awaiting approval', label: 'Awaiting approval' },
    { value: 'Awaiting application', label: 'Awaiting application' },
  ];




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
    const formattedDate = dayjs(date, 'MMDDYYYY').toISOString();

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
        onClose();
        getTasks && getTasks();

      } else {
        throw new Error('Failed to update task status.');
      }
    } catch (error) {
      console.log(error)
    }
  };

  return (
    <div className="m-10 flex flex-col gap-5">
      <Typography variant={TypographyVariant.H4}>
        {t(`${'setTaskAsPending'}`)}
      </Typography>
      <FieldDateSelect
        label={(t(`followUpDate`) as string)}
        onChange={handleDateChange}
        size={FieldSize.Small}
        type={FieldType.BaseActive}
        value={date}
        isFutureDateDisabled={false}
        isPastDateDisabled={true}
      />
      <SelectSimple
        className="max-w-lg placeholder:text-gray-400"
        label={t('reason') as string}
        options={pendingReasonOptions}
        onChange={handleReasonChange}
        size={FieldSize.Small}
        placeholder={t('selectReason') as string}
        value={pendingReason}
        name="form-type"
      />

      <div className="flex justify-end align-middle">
        <Button
          className="mr-4"
          onClick={onClose}
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
          {t('updateStatus')}
        </Button>
      </div>

    </div>


  )
}

export default TaskQueueDrawer