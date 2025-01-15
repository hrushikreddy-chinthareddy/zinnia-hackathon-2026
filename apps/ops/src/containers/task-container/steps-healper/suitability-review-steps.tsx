import { GetStepsProps } from './types';
import { Step } from '../../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import ConfirmStep from '../components/steps/confirm/confirm-step';
import { MemoizedTaskFormStep as TaskFormStep } from '../components/steps/task-form/task-form-step';

export const getSuitabilityReviewSteps = ({ taskType, taskInfoLink, t, taskMetadata }: GetStepsProps) => {
    const steps: Step[] = [
        {
            ariaLabel: t('tabs.taskReview'),
            isVisible: () => true,
            component: <TaskFormStep taskInfoLink={taskInfoLink} isSubmit={true} taskMetadata={taskMetadata[0]}></TaskFormStep>,
            text: t('tabs.taskReview'),
            index: 0,
            isCompleted: true,
            screenReaderLabel: t('tabs.taskReview'),
        },
        {
            ariaLabel: t('tabs.confirm'),
            isVisible: () => true,
            component: <ConfirmStep taskType={taskType} taskInfoLink={taskInfoLink}></ConfirmStep>,
            text: t('tabs.confirm'),
            index: 1,
            screenReaderLabel: t('tabs.confirm'),
        },
    ];
    return steps;
};
