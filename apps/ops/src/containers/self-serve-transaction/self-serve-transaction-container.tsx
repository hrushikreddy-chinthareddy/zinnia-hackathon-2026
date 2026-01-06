import { IChangeEvent } from '@rjsf/core';
import { GenericObjectType, RJSFSchema } from '@rjsf/utils';
import { createRef, RefObject, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DynamicForm from '@deps/components/dynamic-form/dynamic-form';
import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import StartStep from '@deps/components/workflows/start-step/start-step';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { Processes } from '@deps/models/case/case';
import { browserLogError } from '@deps/utils/browser-logging';
import { Policy } from '@zinnia/api-types/types/sor';

import { useSelfServeTransactionContext } from './self-serve-transaction-provider';
import ConfirmStep from './steps/confirm-step';
import {
    SelfServeTransaction,
    SelfServeTransactionSubmitResult,
    ValidationSummaryStatus,
} from './types';
import ProgressBarSteps from '../progress-bar-steps/progress-bar-steps';
import { Step } from '../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';

type SelfServeTransactionContainerProps = {
    initialCustomData: any;
    initialFormData: any;
    transactionType: SelfServeTransaction;
    policy: Policy;
    metaData: any;
    parentPage: ParentPage;
    leaveTransactionLink: string;
    processType: Processes;
    processSubType: Processes[];
    startStepTitle: string;
    startStepSubtitle?: string;
    submitResponseHandler: (
        payload: any
    ) => Promise<SelfServeTransactionSubmitResult>;
    confirmStepSubtitle: string;
};

const SelfServeTransactionContainer = ({
    initialCustomData,
    initialFormData,
    transactionType,
    policy,
    metaData,
    parentPage,
    leaveTransactionLink,
    processType,
    processSubType,
    startStepTitle,
    startStepSubtitle = '',
    submitResponseHandler,
    confirmStepSubtitle,
}: SelfServeTransactionContainerProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'selfServeTransaction',
    });
    const { schemaContent } = metaData;
    const { currentStepIndex, setCurrentStepIndex, goToNext } = useWorkflow();
    const { formData, setFormData } = useSelfServeTransactionContext();
    const [validationSummary, setValidationSummary] = useState<any>(null);
    const [hasValidationErrors, setHasValidationErrors] =
        useState<boolean>(false);

    const steps = schemaContent.tabSchemas;
    const formRefs = useMemo(
        () =>
            Array.from({ length: steps.length + 2 }).map(() =>
                createRef<any>()
            ),
        [steps]
    );

    // Initialize formData with initialCustomData only once
    useEffect(() => {
        if (initialCustomData && Object.keys(initialCustomData).length > 0) {
            setFormData((prev: any) => ({
                ...prev,
                ...initialCustomData,
            }));
        }
    }, [initialCustomData, setFormData]);

    useEffect(() => {
        if (!formData?.actionData) return;

        setFormData((prev: any) => ({
            ...prev,
            ...formData.actionData,
        }));
    }, [formData?.actionData, setFormData]);

    const mergedFormContext = useMemo(
        () => ({
            customData: formData,
            setCustomData: (patch: any) => {
                setFormData((prev: any) => ({
                    ...prev,
                    ...patch,
                }));
            },
            setValidationSummary,
        }),
        [formData, setFormData]
    );

    const handleStepContinue = (
        stepTitle: string,
        currentRef: RefObject<any>
    ) => {
        if (currentRef.current) {
            const isValid = currentRef.current.validateForm?.() || false;
            const hasApiValidationErrors =
                validationSummary &&
                validationSummary.status !== ValidationSummaryStatus.SUCCESS;
            const canProceed =
                stepTitle == 'Summary'
                    ? isValid && !hasApiValidationErrors
                    : isValid;

            setHasValidationErrors(!isValid);

            if (!canProceed) {
                browserLogError(
                    `${transactionType} Self Serve Transaction Error::Form is not valid, skipping submit.`
                );
                return;
            }
            currentRef.current.submit?.();
        }
    };

    const handleFormChange = (
        event: IChangeEvent<any, RJSFSchema, GenericObjectType>
    ) => {
        setFormData((formData: any) => ({
            ...formData,
            ...event.formData,
        }));
        if (hasValidationErrors) {
            setHasValidationErrors(false);
        }
    };

    const handleStepChange = (step: Step) => {
        if (
            step.index <= currentStepIndex &&
            currentStepIndex !== allSteps.length - 1
        )
            setCurrentStepIndex(step.index);
    };

    const handleSubmit = () => {
        goToNext();
    };

    const dynamicSteps: Step[] = steps.map((step: any, index: number) => {
        return {
            isVisible: () => true,
            component: (
                <WorkflowCard
                    key={`step-${index + 1}-${currentStepIndex}`}
                    title={step?.title ?? ''}
                    footerContent={
                        <TransactionNavigationButtons
                            submitLabel={t('continue') ?? ''}
                            cancelLabel={t('cancel') ?? ''}
                            isSubmit={false}
                            disableContinue={hasValidationErrors}
                            handleContinue={() =>
                                handleStepContinue(
                                    step.title,
                                    formRefs[currentStepIndex]
                                )
                            }
                            parentPage={parentPage}
                            leaveTransactionLink={leaveTransactionLink}
                        />
                    }
                >
                    <DynamicForm
                        ref={formRefs[currentStepIndex]}
                        taskMetadata={step}
                        formData={formData}
                        onChange={handleFormChange}
                        onSubmit={handleSubmit}
                        formContext={mergedFormContext}
                    />
                </WorkflowCard>
            ),
            text: step?.title,
            index: index + 1,
            isCompleted: false,
            screenReaderLabel: step?.title || '',
            isDisabled: false,
        };
    });

    const startStep: Step = {
        isVisible: () => true,
        component: (
            <StartStep
                parentPage={parentPage}
                policy={policy}
                state={formData}
                setState={setFormData}
                title={startStepTitle}
                subtitle={startStepSubtitle}
                processType={processType}
                processSubType={processSubType}
                leaveTransactionLink={leaveTransactionLink}
            />
        ),
        text: startStepTitle,
        index: 0,
        screenReaderLabel: startStepTitle,
    };

    const confirmStep: Step = {
        isVisible: () => true,
        component: (
            <ConfirmStep
                customData={formData}
                transactionType={transactionType}
                submitResponseHandler={submitResponseHandler}
                subTitle={confirmStepSubtitle}
            />
        ),
        text: t('confirm.header'),
        index: dynamicSteps.length + 1,
        screenReaderLabel: t('confirm.header'),
    };

    const allSteps = [startStep, ...dynamicSteps, confirmStep];

    useEffect(() => {
        if (
            !initialFormData ||
            Object.keys(initialFormData).length === 0 ||
            !policy
        )
            return;
        setFormData(initialFormData);
    }, [initialFormData, setFormData, policy]);

    return (
        <div>
            <ProgressBarSteps
                steps={allSteps}
                currentStepIndex={currentStepIndex}
                onClick={handleStepChange}
            />
            {allSteps[currentStepIndex].component}
        </div>
    );
};

export default SelfServeTransactionContainer;
