import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import { WorkflowProvider } from '@deps/contexts/WorkflowContainerContext';
import { FormMetadata, TaskType } from '@deps/models/case/task';

import { stepsProvider } from './steps-healper/steps-provider';
import { TaskDataContext } from './task-context';
import { TaskWorkflowContent } from './task-workflow-content';
import CompleteCard from '@deps/components/workflows/complete-card/complete-card';
import { TaskStatus } from '@deps/models/case/task-instance';
type TaskContainerProps = {
    taskInfoLink: string;
    nigoExceptions: any;
    nigoSubExceptions: any;
    taskMetadata: FormMetadata[];
    isSaveAsDraftEnabled: boolean;
};

const TaskContainer = ({ taskInfoLink, nigoExceptions, nigoSubExceptions, taskMetadata, isSaveAsDraftEnabled }: TaskContainerProps) => {
    const { task, isReadyForDataEntry } = useContext(TaskDataContext);
    const { carrier, caseId, id, taskType } = task;
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'taskManagement.taskForm' });

    if (task.status === TaskStatus.Completed) {
        return <CompleteCard leaveRoute={taskInfoLink} />;
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
    });

    return (
        <WorkflowProvider>
            <TaskWorkflowContent steps={steps} caseId={caseId} carrierId={carrier} />
        </WorkflowProvider>
    );
};

export default TaskContainer;