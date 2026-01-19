import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import { GetStepsProps, StepTitle } from './types';
import { Step } from '../../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import ConfirmStep from '../components/steps/confirm/confirm-step';
import { MemoizedTaskFormStep as TaskFormStep } from '../components/steps/task-form/task-form-step';

export const getBeneChangeSteps = ({
    taskInfoLink,
    task,
    taskType,
    t,
    taskMetadata,
    isContinueButtonEnabled,
    readOnly,
    featureFlags,
}: GetStepsProps) => {
    const isIssueResolved = task.data.issueResolved;
    const isBeneChangePaperFormSummaryEnabled =
        featureFlags[
            FEATURE_FLAGS.ENABLE_BENE_CHANGE_PAPER_FORM_SUMMARY_SCREEN
        ];

    const filteredTaskMetadata = taskMetadata.filter(
        (item) => item.title !== StepTitle.Summary
    );
    const dynamicSteps = (
        isBeneChangePaperFormSummaryEnabled
            ? taskMetadata
            : filteredTaskMetadata
    ).map((metadata, index) => ({
        ariaLabel: metadata?.title || '',
        isVisible: () => index === 0 || isIssueResolved,
        component: (
            <TaskFormStep
                readonly={readOnly}
                taskInfoLink={taskInfoLink}
                isSubmit={
                    (index === (isBeneChangePaperFormSummaryEnabled ? 4 : 3) &&
                        !readOnly) ||
                    !isIssueResolved
                }
                taskMetadata={metadata}
                key={`step_${index}`}
                isContinueButtonEnabled={isContinueButtonEnabled}
                overrideTitle={true}
            ></TaskFormStep>
        ),
        text: metadata?.title || '',
        index: index,
        screenReaderLabel: metadata?.title || '',
    }));

    const staticSteps: Step[] = [
        {
            isVisible: () => true,
            component: (
                <ConfirmStep
                    taskType={taskType}
                    taskInfoLink={taskInfoLink}
                ></ConfirmStep>
            ),
            text: t('confirm'),
            index: dynamicSteps.length,
            screenReaderLabel: t('confirm'),
        },
    ];

    return [...dynamicSteps, ...staticSteps];
};
