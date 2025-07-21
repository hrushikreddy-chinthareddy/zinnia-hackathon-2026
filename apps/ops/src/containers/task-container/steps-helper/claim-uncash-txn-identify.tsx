import { TaskStatus } from '@deps/models/case/task-instance';

import { GetStepsProps } from './types';
import { Step } from '../../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import ConfirmStep from '../components/steps/confirm/confirm-step';
import { MemoizedTaskFormStep as TaskFormStep } from '../components/steps/task-form/task-form-step';
export const getClaimUncashTxnIdentifySteps = ({
    taskType,
    taskInfoLink,
    t,
    taskMetadata,
    task,
    isContinueButtonEnabled,
}: GetStepsProps) => {
    const readOnly = task.status === TaskStatus.Completed;
    const dynamicSteps = taskMetadata.map((metadata, index) => ({
        ariaLabel: metadata?.title || '',
        isVisible: () => true,
        component: (
            <div className="bg-white shadow-elevation-light-04">
                <TaskFormStep
                    taskInfoLink={taskInfoLink}
                    isSubmit={readOnly ? false : true}
                    taskMetadata={metadata}
                    key={`step_${index}`}
                    readonly={readOnly}
                    isContinueButtonEnabled={isContinueButtonEnabled}
                ></TaskFormStep>
            </div>
        ),
        text: metadata?.title || '',
        isSubmit: true,
        index: index,
        isCompleted: true,
        screenReaderLabel: metadata?.title || '',
    }));

    const staticSteps: Step[] = [
        {
            isVisible: () => true,

            component: (
                <div className="bg-white shadow-elevation-light-04 mb-5 ">
                    {' '}
                    <ConfirmStep
                        taskType={taskType}
                        taskInfoLink={taskInfoLink}
                        isCta={true}
                        ctaLink={`/cases/${task?.caseId}/progress`}
                    />
                </div>
            ),

            text: t('confirm'),
            index: dynamicSteps.length,
            screenReaderLabel: t('confirm'),
        },
    ];

    return [...dynamicSteps, ...staticSteps];
};
