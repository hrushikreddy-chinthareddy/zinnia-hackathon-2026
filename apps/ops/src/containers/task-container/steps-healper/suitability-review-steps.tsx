import { GetStepsProps } from './types';
import { Step } from '../../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import ConfirmStep from '../components/steps/confirm/confirm-step';
import { MemoizedTaskFormStep as TaskFormStep } from '../components/steps/task-form/task-form-step';

export const getSuitabilityReviewSteps = ({ policy, caseId, taskId, taskType, t }: GetStepsProps) => {
    const steps: Step[] = [
        {
            ariaLabel: t('tabs.taskReview'),
            component: <TaskFormStep taskType={taskType} policy={policy} taskInfoLink={''} isSubmit={true}></TaskFormStep>,
            text: t('tabs.taskReview'),
            index: 0,
            isCompleted: true,
            screenReaderLabel: t('tabs.taskReview'),
        },
        {
            ariaLabel: t('tabs.confirm'),
            component: <ConfirmStep caseId={caseId} taskId={taskId} taskType={taskType}></ConfirmStep>,
            text: t('tabs.confirm'),
            index: 1,
            screenReaderLabel: t('tabs.confirm'),
        },
    ];
    return steps;
};
