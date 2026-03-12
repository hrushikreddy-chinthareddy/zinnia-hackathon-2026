import { TabTitle } from '@deps/components/dynamic-form/customization/templates/transaction-accordion/types';
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
    const isOwnerMismatchEnabled =
        featureFlags[FEATURE_FLAGS.BENE_CHANGE_OWNER_MISMATCH];

    const isNigoCase = isIssueResolved === false;
    const isSuccessCase = isIssueResolved === true;

    const baseMetadata = isOwnerMismatchEnabled
        ? taskMetadata.filter((item) => item.title !== TabTitle.ReviewFormData)
        : taskMetadata.filter((item) => item.title !== TabTitle.FormReview);

    const filteredMetadata = isBeneChangePaperFormSummaryEnabled
        ? baseMetadata
        : baseMetadata.filter((item) => item.title !== StepTitle.Summary);

    const dynamicSteps = filteredMetadata.map((metadata, index) => ({
        ariaLabel: metadata?.title || '',
        isVisible: () => {
            if (index === 0) return true;

            if (metadata.title === TabTitle.NIGOSummary) {
                return isOwnerMismatchEnabled && isNigoCase;
            }

            if (metadata.title === TabTitle.OwnerDetails) {
                return !isOwnerMismatchEnabled && isSuccessCase;
            }

            return isSuccessCase;
        },
        component: (
            <TaskFormStep
                readonly={readOnly}
                taskInfoLink={taskInfoLink}
                isSubmit={
                    metadata.title === TabTitle.NIGOSummary ||
                    metadata.title === StepTitle.Summary ||
                    (index === (filteredMetadata?.length ?? 1) - 1 && !readOnly)
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
