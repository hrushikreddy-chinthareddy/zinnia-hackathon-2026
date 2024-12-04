import { convertToCamelCase } from '@zinnia/utils';
import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import { WorkflowProvider } from '@deps/contexts/WorkflowContainerContext';
import { TaskType } from '@deps/models/case/task';

import { stepsProvider } from './steps-healper/steps-provider';
import { TaskDataContext } from './task-context';
import { TaskWorkflowContent } from './task-workflow-content';
type TaskContainerProps = {
    taskInfoLink: string;
    nigoExceptions: any;
    nigoSubExceptions: any;
};

const TaskContainer = ({ taskInfoLink, nigoExceptions, nigoSubExceptions }: TaskContainerProps) => {
    const { task, isReadyForDataEntry } = useContext(TaskDataContext);
    const { carrier, caseId, id, taskType } = task;
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: convertToCamelCase(taskType) });

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
    });

    return (
        <WorkflowProvider>
            <TaskWorkflowContent steps={steps} caseId={caseId} carrierId={carrier} taskInfoLink={taskInfoLink} />
        </WorkflowProvider>
    );
};

export default TaskContainer;
