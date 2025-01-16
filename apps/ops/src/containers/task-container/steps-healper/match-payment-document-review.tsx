import { GetStepsProps } from './types';
import { Step } from '../../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import ConfirmStep from '../components/steps/confirm/confirm-step';
import { MemoizedTaskFormStep as TaskFormStep } from '../components/steps/task-form/task-form-step';

export const getMatchDocumentPaymentReviewSteps = ({ taskType, taskInfoLink, t, taskMetadata }: GetStepsProps) => {
    const dynamicSteps = taskMetadata.map((item: any, index: number) => {
        return {
            ariaLabel: item.title,
            isVisible: () => true,
            component: <TaskFormStep taskInfoLink={taskInfoLink} isSubmit={true} taskMetadata={item}></TaskFormStep>,
            text: item.title,
            index,
            isCompleted: true,
            screenReaderLabel: item.title,
        };
    });
    const staticSteps: Step[] = [
        {
            ariaLabel: t('confirm'),
            isVisible: () => true,
            component: <ConfirmStep taskType={taskType} taskInfoLink={taskInfoLink}></ConfirmStep>,
            text: t('confirm'),
            index: dynamicSteps.length,
            screenReaderLabel: t('confirm'),
        },
    ];

    return [...dynamicSteps, ...staticSteps];
};
