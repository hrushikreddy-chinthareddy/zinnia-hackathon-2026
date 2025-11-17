import { TaskStatus } from '@deps/models/case/task-instance';

import { GetStepsProps } from './types';
import { Step } from '../../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import ConfirmStep from '../components/steps/confirm/confirm-step';
import { MemoizedTaskFormStep as TaskFormStep } from '../components/steps/task-form/task-form-step';

export const getAgentChangeSteps = ({
    taskInfoLink,
    task,
    taskType,
    t,
    taskMetadata,
    isContinueButtonEnabled,
}: GetStepsProps) => {
    const readOnly = task.status === TaskStatus.Completed;

    const isSignaturePresent = task.data.signatures.some(
        (signature: { isSignedPresent: any }) => signature.isSignedPresent
    );

    const issueResolved = task.data.issueResolved;

    const isIGO = isSignaturePresent && issueResolved;

    const dynamicSteps = taskMetadata.map((metadata, index) => ({
        ariaLabel: metadata?.title || '',
        isVisible: () => index === 0 || index === 2 || (index === 1 && isIGO),
        component: (
            <TaskFormStep
                readonly={readOnly}
                taskInfoLink={taskInfoLink}
                isSubmit={!readOnly && index === taskMetadata.length - 1}
                taskMetadata={metadata}
                key={`step_${index}`}
                isContinueButtonEnabled={isContinueButtonEnabled}
            ></TaskFormStep>
        ),
        text: metadata.tabTitle || metadata?.title || '',
        isSubmit: false,
        index: index,
        isCompleted: false,
        screenReaderLabel: metadata?.title || '',
    }));

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
