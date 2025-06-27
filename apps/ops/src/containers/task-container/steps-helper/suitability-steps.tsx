import { TaskStatus } from '@deps/models/case/task-instance';

import { GetStepsProps } from './types';
import { Step } from '../../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import ConfirmStep from '../components/steps/confirm/confirm-step';
import { MemoizedTaskFormStep as TaskFormStep } from '../components/steps/task-form/task-form-step';
import { TaskReviewStep } from '../components/steps/task-review/task-review-step';

export const getSuitabilitySteps = ({
    carrierId,
    caseId,
    taskInfoLink,
    task,
    taskType,
    isReadyForDataEntry,
    t,
    taskMetadata,
    isSaveAsDraftEnabled,
    isContinueButtonEnabled,
}: GetStepsProps) => {
    const readOnly = task.status === TaskStatus.Completed;
    const steps: Step[] = [
        {
            isVisible: () => true,
            component: (
                <TaskReviewStep
                    caseId={caseId}
                    clientCode={carrierId}
                    taskInfoLink={taskInfoLink}
                    taskType={taskType}
                />
            ),
            text: t('tabs.start'),
            index: 0,
            isCompleted: true,
            screenReaderLabel: taskMetadata[0]?.title || '',
        },
        {
            isVisible: () => isReadyForDataEntry,
            component: (
                <TaskFormStep
                    readonly={task.status === TaskStatus.Completed}
                    taskInfoLink={taskInfoLink}
                    isSubmit={false}
                    taskMetadata={taskMetadata[0]}
                    isSaveAsDraftEnabled={
                        readOnly ? false : isSaveAsDraftEnabled
                    }
                    isContinueButtonEnabled={isContinueButtonEnabled}
                ></TaskFormStep>
            ),
            text: t('tabs.suitabilityForm'),
            index: 1,
            screenReaderLabel: t('tabs.suitabilityForm'),
        },
        {
            isVisible: () => isReadyForDataEntry,
            component: (
                <TaskFormStep
                    isContinueButtonEnabled={isContinueButtonEnabled}
                    taskInfoLink={taskInfoLink}
                    readonly={readOnly || true}
                    isSubmit={!readOnly ? true : false}
                    taskMetadata={taskMetadata[0]}
                ></TaskFormStep>
            ),
            text: t('tabs.summary'),
            index: 2,
            screenReaderLabel: t('tabs.summary'),
        },

        {
            isVisible: () => true,
            component: (
                <ConfirmStep
                    taskType={taskType}
                    taskInfoLink={taskInfoLink}
                ></ConfirmStep>
            ),
            text: t('confirm'),
            index: 3,
            screenReaderLabel: t('confirm'),
        },
    ];
    return steps;
};
