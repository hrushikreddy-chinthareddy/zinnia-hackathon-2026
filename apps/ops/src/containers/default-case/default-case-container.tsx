import { WorkflowProvider } from '@deps/contexts/WorkflowContainerContext';
import { FormMetadata } from '@deps/models/case/task';

import DefaultCaseWorkflowContent from './default-case-workflow-content';

type DefaultCaseContainerProps = {
    taskMetadata: FormMetadata[];
};

const DefaultCaseContainer = ({ taskMetadata }: DefaultCaseContainerProps) => {
    return (
        <WorkflowProvider>
            <DefaultCaseWorkflowContent taskMetadata={taskMetadata} />
        </WorkflowProvider>
    );
};

export default DefaultCaseContainer;
