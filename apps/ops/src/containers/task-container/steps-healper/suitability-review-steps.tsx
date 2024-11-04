import { GetStepsProps } from './types';
import { Step } from '../../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import ConfirmStep from '../components/steps/confirm/confirm-step';
import { MemoizedTaskFormStep as TaskFormStep } from '../components/steps/task-form/task-form-step';

export const getSuitabilityReviewSteps = ({ caseId, taskId, taskType }: GetStepsProps) => {
    const steps: Step[] = [
        {
            ariaLabel: 'Review Suitability',
            component: <TaskFormStep taskType={taskType}></TaskFormStep>,
            text: 'Review Suitability',
            index: 0,
            isCompleted: true,
            screenReaderLabel: 'Review Suitability',
        },
        {
            ariaLabel: 'Confirm',
            component: <ConfirmStep caseId={caseId} taskId={taskId} taskType={taskType}></ConfirmStep>,
            text: 'Confirm',
            index: 1,
            screenReaderLabel: 'Confirm',
        },
    ];
    return steps;
};
