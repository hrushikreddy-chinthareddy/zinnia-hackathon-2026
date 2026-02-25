import { useTranslation } from 'next-i18next';

import { BadgeVariant } from '@deps/components/badge/badge.helpers';
import GlobalValuesBar from '@deps/components/global-values/global-values-bar/global-values-bar';
import GlobalValuesNbBar from '@deps/components/global-values/global-values-bar/global-values-nb-bar';
import DefaultTaskCard from '@deps/components/workflows/default-task-card/default-task-card';
import { TranslationFiles } from '@deps/config/translations';
import ProgressBarSteps from '@deps/containers/progress-bar-steps/progress-bar-steps';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import ConfirmStep from '@deps/containers/task-container/components/steps/confirm/confirm-step';
import { useDefaultCase } from '@deps/contexts/DefaultCaseContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { FormMetadata, TaskType } from '@deps/models/case/task';
import { browserLogWarn } from '@deps/utils/browser-logging';
import { policyOwner } from '@deps/utils/data';
import { Party, PolicyStatus, ProductType } from '@zinnia/api-types/types/sor';

import { MemoizedDefaultCaseFormStep } from './steps/default-case-form-step';

type DefaultCaseWorkflowContentProps = {
    taskMetadata: FormMetadata[];
    taskType: TaskType;
};

const DefaultCaseWorkflowContent = ({
    taskMetadata,
    taskType,
}: DefaultCaseWorkflowContentProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'taskManagement.taskForm',
    });
    const { currentStepIndex, setCurrentStepIndex } = useWorkflow();
    const { policy, caseDetails } = useDefaultCase();
    const owner = policy ? policyOwner(policy) : '';

    const taskInfoLink = policy
        ? `/policies/${policy?.product?.planCode}/${policy?.policyNumber}/policy/policy-details`
        : `/cases/${caseDetails?.id}`;
    const handleProgressBarClick = (step: Step) => {
        if (
            step.isDisabled ||
            step.isCompleted ||
            currentStepIndex === step.index
        )
            return;
        setCurrentStepIndex(step.index);
    };

    if (taskMetadata.length === 0) {
        browserLogWarn('default-case-workflow-content::missing-task-metadata', {
            caseId: caseDetails?.id,
            policyNumber: policy?.policyNumber,
            planCode: policy?.product?.planCode,
            taskType: taskType as TaskType,
        });
        return <DefaultTaskCard leaveRoute={taskInfoLink} />;
    }

    const getSteps = () => {
        const dynamicSteps = taskMetadata.map((metadata, index) => {
            return {
                ariaLabel: metadata?.title || '',
                isVisible: () => true,
                component: (
                    <MemoizedDefaultCaseFormStep
                        taskInfoLink={taskInfoLink}
                        isSubmit={taskMetadata.length === index + 1}
                        taskMetadata={metadata}
                        key={`step_${index}`}
                    ></MemoizedDefaultCaseFormStep>
                ),
                text: metadata?.title || '',
                isSubmit: taskMetadata.length === index + 1,
                index: index,
                isCompleted: true,
                screenReaderLabel: metadata?.title || '',
            };
        });

        const staticSteps: Step[] = [
            {
                isVisible: () => true,
                component: (
                    <ConfirmStep
                        taskType={taskType as TaskType}
                        taskInfoLink={taskInfoLink}
                        isCta={true}
                        ctaLink={'/cases'}
                        ctaText={t('cases') as string}
                    ></ConfirmStep>
                ),
                text: t('confirm'),
                index: dynamicSteps.length,
                screenReaderLabel: t('confirm'),
            },
        ];

        return [...dynamicSteps, ...staticSteps];
    };

    const steps = getSteps();

    return (
        <div className="workflow-height-adjusted flex w-full max-w-[1130px] flex-col self-center">
            <div className="flex">
                {caseDetails ? (
                    <GlobalValuesNbBar
                        carrierId={caseDetails?.carrier}
                        showLink={true}
                        caseId={caseDetails?.id}
                    />
                ) : (
                    <GlobalValuesBar
                        carrierId={policy?.carrierId || ''}
                        marketingName={policy?.product?.marketingName}
                        owner={owner as Party}
                        planCode={policy?.product?.planCode}
                        policyNumber={policy?.policyNumber}
                        productType={
                            policy?.product?.productType as ProductType
                        }
                        status={policy?.policyStatus as PolicyStatus}
                        tooltip={''}
                        variant={BadgeVariant.Default}
                    />
                )}
            </div>
            <ProgressBarSteps
                classNames={`grid-cols-${steps.length}`}
                currentStepIndex={currentStepIndex}
                onClick={handleProgressBarClick}
                steps={steps}
            />
            <div className="my-2 flex w-full grow flex-col rounded bg-white shadow-elevation-light-04">
                {steps[currentStepIndex]?.component}
            </div>
        </div>
    );
};

export default DefaultCaseWorkflowContent;
