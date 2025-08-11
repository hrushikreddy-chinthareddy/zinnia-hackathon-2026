import { TaskStatus } from '@deps/models/case/task-instance';
import { Carrier } from '@deps/models/case/withdrawal/case';

import { GetStepsProps } from './types';
import ConfirmStep from '../components/steps/confirm/confirm-step';
import { MemoizedTaskFormStep as TaskFormStep } from '../components/steps/task-form/task-form-step';

export const getSuitabilityReviewSteps = ({
    task,
    taskType,
    isSaveAsDraftEnabled,
    isContinueButtonEnabled,
    taskInfoLink,
    t,
    taskMetadata,
}: GetStepsProps) => {
    const readOnly = task.status === TaskStatus.Completed;
    if (task.carrier === Carrier.SBGC) {
        return [
            {
                isVisible: () => true,
                component: (
                    <TaskFormStep
                        readonly={true}
                        key={`step_${0}`}
                        isSaveAsDraftEnabled={false}
                        isContinueButtonEnabled={true}
                        taskInfoLink={taskInfoLink}
                        isSubmit={false}
                        taskMetadata={taskMetadata[0]}
                    />
                ),
                text: taskMetadata[0]?.title || '',
                index: 0,
                isCompleted: true,
                screenReaderLabel: taskMetadata[0]?.title || '',
            },
            {
                isVisible: () => true,
                component: (
                    <TaskFormStep
                        key={`step_${1}`}
                        readonly={readOnly}
                        isSaveAsDraftEnabled={
                            readOnly ? false : isSaveAsDraftEnabled
                        }
                        isContinueButtonEnabled={isContinueButtonEnabled}
                        taskInfoLink={taskInfoLink}
                        isSubmit={!readOnly}
                        taskMetadata={taskMetadata[1]}
                    />
                ),
                text: taskMetadata[1]?.title || '',
                index: 1,
                isCompleted: true,
                screenReaderLabel: taskMetadata[1]?.title || '',
            },
            {
                isVisible: () => true,
                component: (
                    <ConfirmStep
                        taskType={taskType}
                        taskInfoLink={taskInfoLink}
                    />
                ),
                text: t('confirm'),
                index: 2,
                screenReaderLabel: t('confirm'),
            },
        ];
    }

    return [
        {
            isVisible: () => true,
            component: (
                <TaskFormStep
                    readonly={readOnly}
                    key={`step_${0}`}
                    isSaveAsDraftEnabled={
                        readOnly ? false : isSaveAsDraftEnabled
                    }
                    isContinueButtonEnabled={isContinueButtonEnabled}
                    taskInfoLink={taskInfoLink}
                    isSubmit={!readOnly}
                    taskMetadata={taskMetadata[0]}
                />
            ),
            text: taskMetadata[0]?.title || '',
            index: 0,
            isCompleted: true,
            screenReaderLabel: taskMetadata[0]?.title || '',
        },
        {
            isVisible: () => true,
            component: (
                <ConfirmStep taskType={taskType} taskInfoLink={taskInfoLink} />
            ),
            text: t('confirm'),
            index: 1,
            screenReaderLabel: t('confirm'),
        },
    ];
};
