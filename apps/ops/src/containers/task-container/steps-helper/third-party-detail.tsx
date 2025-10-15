import { TaskStatus } from '@deps/models/case/task-instance';

import { GetStepsProps } from './types';
import { Step } from '../../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import ConfirmStep from '../components/steps/confirm/confirm-step';
import { MemoizedTaskFormStep as TaskFormStep } from '../components/steps/task-form/task-form-step';

export const getThirdPartyDetailSteps = ({
    taskInfoLink,
    task,
    taskType,
    t,
    taskMetadata,
    isContinueButtonEnabled,
}: GetStepsProps) => {
    const readOnly = task.status === TaskStatus.Completed;
    const isIssueResolved = task.data.issueResolved;

    const dynamicSteps = [
        {
            ariaLabel: taskMetadata[0]?.title || '',
            isVisible: () => true,
            component: (
                <TaskFormStep
                    readonly={readOnly}
                    taskInfoLink={taskInfoLink}
                    taskMetadata={taskMetadata[0]}
                    key={`step_${0}`}
                    isContinueButtonEnabled={isContinueButtonEnabled}
                ></TaskFormStep>
            ),
            text: taskMetadata[0]?.title || '',
            index: 0,
            isCompleted: true,
            screenReaderLabel: taskMetadata[0]?.title || '',
        },
        {
            ariaLabel: taskMetadata[1]?.title || '',
            isVisible: () => isIssueResolved,
            component: (
                <TaskFormStep
                    readonly={readOnly}
                    taskInfoLink={taskInfoLink}
                    taskMetadata={taskMetadata[1]}
                    key={`step_${1}`}
                    isContinueButtonEnabled={isContinueButtonEnabled}
                ></TaskFormStep>
            ),
            text: taskMetadata[1]?.title || '',
            isSubmit: true,
            index: 1,
            isCompleted: true,
            screenReaderLabel: taskMetadata[1]?.title || '',
        },
        {
            ariaLabel: taskMetadata[2]?.title || '',
            isVisible: () => isIssueResolved,
            component: (
                <TaskFormStep
                    readonly={readOnly}
                    taskInfoLink={taskInfoLink}
                    taskMetadata={taskMetadata[2]}
                    key={`step_${2}`}
                    isContinueButtonEnabled={isContinueButtonEnabled}
                ></TaskFormStep>
            ),
            text: taskMetadata[2]?.title || '',
            isSubmit: true,
            index: 2,
            isCompleted: true,
            screenReaderLabel: taskMetadata[2]?.title || '',
        },
        {
            ariaLabel: taskMetadata[3]?.title || '',
            isVisible: () => !isIssueResolved,
            component: (
                <TaskFormStep
                    readonly={readOnly}
                    taskInfoLink={taskInfoLink}
                    isSubmit={true}
                    taskMetadata={taskMetadata[3]}
                    key={`step_${3}`}
                    isContinueButtonEnabled={isContinueButtonEnabled}
                ></TaskFormStep>
            ),
            text: taskMetadata[3].title || '',
            index: 3,
            isCompleted: true,
            screenReaderLabel: taskMetadata[3].title || '',
        },
    ];

    const staticSteps: Step[] = [
        {
            isVisible: () => true,
            component: (
                <ConfirmStep
                    taskType={taskType}
                    taskInfoLink={taskInfoLink}
                    isCta={true}
                ></ConfirmStep>
            ),
            text: t('confirm'),
            index: dynamicSteps.length,
            screenReaderLabel: t('confirm'),
        },
    ];

    return [...dynamicSteps, ...staticSteps];
};
