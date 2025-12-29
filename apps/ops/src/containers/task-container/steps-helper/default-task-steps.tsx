import { TaskStatus } from '@deps/models/case/task-instance';

import { GetStepsProps } from './types';
import { MemoizedTaskFormStep as TaskFormStep } from '../components/steps/task-form/task-form-step';

const getDefaultTaskSteps = ({
    task,
    taskInfoLink,
    taskMetadata,
}: GetStepsProps) => {
    const readOnly = task.status === TaskStatus.Completed;

    const steps = taskMetadata.map((metadata, index) => ({
        ariaLabel: metadata?.title || '',
        isVisible: () => Boolean(true),
        component: (
            <TaskFormStep
                readonly={readOnly}
                taskInfoLink={taskInfoLink}
                isSubmit={readOnly ? false : true}
                taskMetadata={metadata}
                key={`step_${index}`}
            ></TaskFormStep>
        ),
        text: metadata?.title || '',
        isSubmit: true,
        index: index,
        isCompleted: true,
        screenReaderLabel: metadata?.title || '',
    }));

    return steps;
};

export default getDefaultTaskSteps;
