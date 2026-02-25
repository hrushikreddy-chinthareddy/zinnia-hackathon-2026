import { GetStepsProps } from './types';
import ConfirmStep from '../components/steps/confirm/confirm-step';
import { MemoizedTaskFormStep as TaskFormStep } from '../components/steps/task-form/task-form-step';

const getDefaultTaskSteps = ({
    taskInfoLink,
    taskMetadata,
    readOnly,
    task,
    t,
}: GetStepsProps) => {
    const steps = taskMetadata.map((metadata, index) => ({
        ariaLabel: metadata?.title || '',
        isVisible: () => Boolean(true),
        component: (
            <TaskFormStep
                readonly={readOnly}
                taskInfoLink={taskInfoLink}
                isSubmit={!readOnly}
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

    const confirmStep = {
        ariaLabel: t('confirm'),
        isVisible: () => Boolean(true),
        component: (
            <ConfirmStep
                taskType={task?.taskType}
                taskInfoLink={taskInfoLink}
            ></ConfirmStep>
        ),
        text: t('confirm'),
        index: taskMetadata.length,
        screenReaderLabel: t('confirm'),
        isSubmit: true,
        isCompleted: true,
    };

    return [...steps, confirmStep];
};

export default getDefaultTaskSteps;
