import { WorkflowProvider } from '@deps/contexts/WorkflowContainerContext';
import { TaskType } from '@deps/models/case/task';
import { Policy } from '@deps/models/policy/sor-policy';

import { getSteps } from './steps.helper';
import { TaskWorkflowContent } from './task-workflow-content';

type TaskContainerProps = {
    policy: Policy;
    caseId: string;
    taskId: string;
    taskType: TaskType;
    docType: string;
    documentNumber: string;
    clientCode: string;
    taskInfoLink: string;
};

const TaskContainer = ({ policy, docType, documentNumber, clientCode, caseId, taskId, taskType, taskInfoLink }: TaskContainerProps) => {
    const steps = getSteps({ policyNumber: policy.id || '', docType, clientCode, documentNumber, caseId, taskId, taskType });
    return (
        <WorkflowProvider>
            <TaskWorkflowContent
                steps={steps}
                policy={policy}
                docType={docType}
                clientCode={clientCode}
                documentNumber={documentNumber}
                caseId={caseId}
                taskId={taskId}
                taskType={taskType}
                taskInfoLink={taskInfoLink}
            />
        </WorkflowProvider>
    );
};

export default TaskContainer;
