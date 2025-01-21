import { v4 as uuidv4 } from 'uuid';

import { MatchingCase } from '@deps/models/case/task/doc-matching-payment';

import { GetStepsProps } from './types';
import { Step } from '../../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import ConfirmStep from '../components/steps/confirm/confirm-step';
import { MemoizedTaskFormStep as TaskFormStep } from '../components/steps/task-form/task-form-step';

export const getMatchDocumentPaymentReviewSteps = ({ taskType, taskInfoLink, t, taskMetadata, task }: GetStepsProps) => {
    const docMatchKey = uuidv4();
    const paymentMatchKey = uuidv4();

    const isSubmit = task.data.potentialMatches === MatchingCase.REINDEX;

    // todo:vijaya: commenting this for demo
    // const dynamicSteps = taskMetadata.map((item: any, index: number) => {
    //     const isStepVisible = (isSubmit: boolean, index: number, length: number): boolean => {
    //         if (isSubmit && index === length - 1) {
    //             return false;
    //         }
    //         if (index === length - 2) {
    //             return true;
    //         }
    //         return true;
    //     };

    const dynamicSteps = [
        {
            ariaLabel: taskMetadata[0].title || '',
            isVisible: () => true,
            component: (
                <TaskFormStep
                    taskInfoLink={taskInfoLink}
                    isSubmit={isSubmit}
                    taskMetadata={taskMetadata[0]}
                    key={docMatchKey}
                ></TaskFormStep>
            ),
            text: taskMetadata[0].title || '',
            index: 0,
            isCompleted: true,
            screenReaderLabel: taskMetadata[0].title || '',
        },
        {
            ariaLabel: taskMetadata[1].title || '',
            isVisible: () => true,
            component: (
                <TaskFormStep
                    taskInfoLink={taskInfoLink}
                    isSubmit={true}
                    taskMetadata={taskMetadata[1]}
                    key={paymentMatchKey}
                ></TaskFormStep>
            ),
            text: taskMetadata[1].title || '',
            index: 1,
            isCompleted: true,
            screenReaderLabel: taskMetadata[1].title || '',
        },
    ];

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
