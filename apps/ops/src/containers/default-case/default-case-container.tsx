import { WorkflowProvider } from '@deps/contexts/WorkflowContainerContext';
import { FormMetadata, TaskType } from '@deps/models/case/task';

import DefaultCaseWorkflowContent from './default-case-workflow-content';

type DefaultCaseContainerProps = {
    taskMetadata: FormMetadata[];
    taskType: TaskType;
};

const DefaultCaseContainer = ({
    taskMetadata,
    taskType,
}: DefaultCaseContainerProps) => {
    return (
        <WorkflowProvider>
            <DefaultCaseWorkflowContent
                taskMetadata={taskMetadata}
                taskType={taskType}
            />
        </WorkflowProvider>
    );
};

export default DefaultCaseContainer;
