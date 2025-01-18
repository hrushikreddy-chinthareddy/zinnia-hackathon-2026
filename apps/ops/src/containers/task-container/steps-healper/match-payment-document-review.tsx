import { v4 as uuidv4 } from 'uuid';

import { GetStepsProps } from './types';
import { Step } from '../../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import ConfirmStep from '../components/steps/confirm/confirm-step';
import { MemoizedTaskFormStep as TaskFormStep } from '../components/steps/task-form/task-form-step';

export const getMatchDocumentPaymentReviewSteps = ({ taskType, taskInfoLink, t, taskMetadata, task }: GetStepsProps) => {
    const dynamicSteps = taskMetadata.map((item: any, index: number) => {
        const key = uuidv4();
        const isSubmit = task.data.potentialMatches === 'notMatched';

        const isStepVisible = (isSubmit: boolean, index: number, length: number): boolean => {
            if (isSubmit && index === length - 1) {
                return false;
            }
            if (index === length - 2) {
                return true;
            }
            return true;
        };

        return {
            ariaLabel: item.title,
            isVisible: () => isStepVisible(isSubmit, index, taskMetadata.length), // should be false for Reindexing case
            component: (
                <TaskFormStep taskInfoLink={taskInfoLink} isSubmit={isSubmit && index === 0} taskMetadata={item} key={key}></TaskFormStep>
            ),
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
