import { useContext } from 'react';

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
    const { task } = useContext(TaskDataContext);
    const { carrier, caseId, id, taskType } = task;

    const steps = stepsProvider.getSteps(taskType as TaskType, {
        policy,
        docType,
        clientCode: carrier,
        documentNumber,
        caseId,
        taskId: id,
        taskType: taskType as TaskType,
    });

    return (
        <WorkflowProvider>
            <TaskWorkflowContent
                steps={steps}
                policy={policy}
                docType={docType}
                documentNumber={documentNumber}
                taskInfoLink={taskInfoLink}
            />
        </WorkflowProvider>
    );
};

export default TaskContainer;
