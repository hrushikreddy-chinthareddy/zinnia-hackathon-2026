import { RJSFSchema, UiSchema } from '@rjsf/utils';

import { WorkflowProvider } from '@deps/contexts/WorkflowContainerContext';
import { TaskType } from '@deps/models/case/task';

import { TaskWorkflow } from './task-workflow';

type TaskContainerProps = {
    caseId: string;
    taskId: string;
    taskType: TaskType;
    formSchema: RJSFSchema;
    uiSchema: UiSchema;
    taskData: any;
};

const TaskContainer = ({ caseId, taskId, taskType, formSchema, uiSchema, taskData }: TaskContainerProps) => {
    return (
        <WorkflowProvider>
            <TaskWorkflow
                caseId={caseId ?? ''}
                taskId={taskId ?? ''}
                taskType={taskType ?? ''}
                taskData={taskData ?? {}}
                formSchema={formSchema}
                uiSchema={uiSchema}
            />
        </WorkflowProvider>
    );
};

export default TaskContainer;
