import { MatchingCase } from '@deps/models/case/task/doc-matching-payment';

import { GetStepsProps } from './types';
import { Step } from '../../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import ConfirmStep from '../components/steps/confirm/confirm-step';
import { MemoizedTaskFormStep as TaskFormStep } from '../components/steps/task-form/task-form-step';
import { TaskStatus } from '@deps/models/case/task-instance';

export const getMatchDocumentPaymentReviewSteps = ({
    taskType,
    taskInfoLink,
    t,
    isContinueButtonEnabled,
    taskMetadata,
    task,
}: GetStepsProps) => {
    let isSubmit = task.data.matchingResult === MatchingCase.REINDEX;

    if (task.data.matchingResult === 'NO_MATCH' && task.taskType === 'STANDARD_DOCUMENT_MATCHING') {
        isSubmit = true;
    }

    const dynamicSteps = taskMetadata.map((metadata, index) => ({
        ariaLabel: metadata?.title || '',
        isVisible: () => index === 0 || !isSubmit,
        component: (
            <TaskFormStep
                readonly={task.status === TaskStatus.Completed}
                taskInfoLink={taskInfoLink}
                isSubmit={task.status === TaskStatus.Completed ? false : index === 1 ? true : isSubmit}
                taskMetadata={metadata}
                key={`step_${index}`}
                isContinueButtonEnabled={isContinueButtonEnabled}
            ></TaskFormStep>
        ),
        text: metadata?.title || '',
        isSubmit: index === 1 ? true : isSubmit,
        index: index,
        isCompleted: true,
        screenReaderLabel: metadata?.title || '',
    }));

    const staticSteps: Step[] = [
        {
            isVisible: () => true,
            component: <ConfirmStep taskType={taskType} taskInfoLink={taskInfoLink}></ConfirmStep>,
            text: t('confirm'),
            index: dynamicSteps.length,
            screenReaderLabel: t('confirm'),
        },
    ];

    return [...dynamicSteps, ...staticSteps];
};
