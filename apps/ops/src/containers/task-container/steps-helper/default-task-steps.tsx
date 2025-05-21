import { GetStepsProps } from './types';
import ConfirmStep from '../components/steps/confirm/confirm-step';
import { MemoizedTaskFormStep as TaskFormStep } from '../components/steps/task-form/task-form-step';

const getDefaultTaskSteps = ({ taskType, taskInfoLink, t, taskMetadata }: GetStepsProps) => {
    const confirmStep = {
        ariaLabel: t('confirm'),
        isVisible: () => Boolean(true),
        component: <ConfirmStep taskType={taskType} taskInfoLink={taskInfoLink}></ConfirmStep>,
        text: t('confirm'),
        index: taskMetadata.length,
        screenReaderLabel: t('confirm'),
        isSubmit: true,
        isCompleted: true,
    };

    const steps = taskMetadata.map((metadata, index) => ({
        ariaLabel: metadata?.title || '',
        isVisible: () => Boolean(true),
        component: <TaskFormStep taskInfoLink={taskInfoLink} isSubmit={true} taskMetadata={metadata} key={`step_${index}`}></TaskFormStep>,
        text: metadata?.title || '',
        isSubmit: true,
        index: index,
        isCompleted: true,
        screenReaderLabel: metadata?.title || '',
    }));

    return steps;
};

export default getDefaultTaskSteps;
