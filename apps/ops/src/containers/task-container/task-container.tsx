import { convertToCamelCase } from '@zinnia/utils';
import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import { WorkflowProvider } from '@deps/contexts/WorkflowContainerContext';
import { TaskType } from '@deps/models/case/task';
import { Policy } from '@deps/models/policy/sor-policy';

import { stepsProvider } from './steps-healper/steps-provider';
import { TaskDataContext } from './task-context';
import { TaskWorkflowContent } from './task-workflow-content';
type TaskContainerProps = {
    policy: Policy;
    docType: string;
    documentNumber: string;
    taskInfoLink: string;
};

const TaskContainer = ({ policy, docType, documentNumber, taskInfoLink }: TaskContainerProps) => {
    const { task, isReadyForDataEntry } = useContext(TaskDataContext);
    const { carrier, caseId, id, taskType } = task;
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: convertToCamelCase(taskType) });

    const steps = stepsProvider.getSteps(taskType as TaskType, {
        docType,
        carrierId: carrier,
        documentNumber,
        caseId,
        taskId: id,
        taskType: taskType as TaskType,
        t,
        isReadyForDataEntry,
    });

    return (
        <WorkflowProvider>
            <TaskWorkflowContent
                policy={policy}
                steps={steps}
                caseId={caseId}
                carrierId={carrier}
                documentNumber={documentNumber}
                taskInfoLink={taskInfoLink}
            />
        </WorkflowProvider>
    );
};

export default TaskContainer;
