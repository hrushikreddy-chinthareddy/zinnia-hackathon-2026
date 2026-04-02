import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import DefaultTaskCard from '@deps/components/workflows/default-task-card/default-task-card';
import { TranslationFiles } from '@deps/config/translations';
import { TASK_MODE_EDIT } from '@deps/constants/task';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { WorkflowProvider } from '@deps/contexts/WorkflowContainerContext';
import { FormMetadata, TaskType } from '@deps/models/case/task';
import { browserLogWarn } from '@deps/utils/browser-logging';

import { stepsProvider } from './steps-helper/steps-provider';
import { TaskDataContext } from './task-context';
import { TaskWorkflowContent } from './task-workflow-content';
type TaskContainerProps = {
    taskInfoLink: string;
    nigoExceptions: any;
    nigoSubExceptions: any;
    taskMetadata: FormMetadata[];
    isSaveAsDraftEnabled: boolean;
    isContinueButtonEnabled: boolean;
    /** When true, data entry is editable without `?mode=edit` (e.g. embedded previews). */
    forceEditMode?: boolean;
};

const TaskContainer = ({
    taskInfoLink,
    nigoExceptions,
    nigoSubExceptions,
    taskMetadata,
    isSaveAsDraftEnabled,
    isContinueButtonEnabled,
    forceEditMode = false,
}: TaskContainerProps) => {
    const { task, isReadyForDataEntry } = useContext(TaskDataContext);
    const { carrier, caseId, id, taskType } = task;
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'taskManagement.taskForm',
    });
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode');
    const isEditMode = forceEditMode || mode === TASK_MODE_EDIT;
    const readOnly = !isEditMode;

    const { featureFlags } = useOptimizely();
    if (taskMetadata?.length === 0) {
        browserLogWarn('task-container::Task schema not found', {
            taskId: id,
            taskType: taskType as TaskType,
            carrier: carrier,
            caseId: caseId,
        });
        return <DefaultTaskCard leaveRoute={taskInfoLink} />;
    }
    const steps = stepsProvider.getSteps(taskType as TaskType, {
        carrierId: carrier,
        caseId,
        taskId: id,
        taskInfoLink,
        taskType: taskType as TaskType,
        t,
        isReadyForDataEntry,
        nigoExceptions,
        nigoSubExceptions,
        taskMetadata,
        task,
        isSaveAsDraftEnabled,
        isContinueButtonEnabled,
        readOnly,
        featureFlags,
    });

    return (
        <WorkflowProvider>
            <TaskWorkflowContent
                steps={steps}
                caseId={caseId}
                carrierId={carrier}
            />
        </WorkflowProvider>
    );
};

export default TaskContainer;
