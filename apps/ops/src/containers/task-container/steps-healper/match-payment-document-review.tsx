import { GetStepsProps } from './types';
import { Step } from '../../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import ConfirmStep from '../components/steps/confirm/confirm-step';
import { MemoizedTaskFormStep as TaskFormStep } from '../components/steps/task-form/task-form-step';

export const getMatchDocumentPaymentReviewSteps = ({ taskType, taskInfoLink, t }: GetStepsProps) => {
    const steps: Step[] = [
        {
            ariaLabel: t('tabs.documentMatch'),
            isVisible: () => true,
            component: <TaskFormStep taskType={taskType} taskInfoLink={taskInfoLink} isSubmit={true}></TaskFormStep>,
            text: t('tabs.documentMatch'),
            index: 0,
            isCompleted: true,
            screenReaderLabel: t('tabs.documentMatch'),
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
