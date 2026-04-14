import Form, { IChangeEvent } from '@rjsf/core';
import { GenericObjectType, RJSFSchema } from '@rjsf/utils';
import { TFunction } from 'i18next';
import {
    createRef,
    RefObject,
    useEffect,
    useMemo,
    useState,
    useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';

import DynamicForm from '@deps/components/dynamic-form/dynamic-form';
import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import StartStep from '@deps/components/workflows/start-step/start-step';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { useCasesQuery } from '@deps/hooks/useCasesQuery';
import { Processes } from '@deps/models/case/case';
import { FormMetadata } from '@deps/models/case/task';
import { browserLogError } from '@deps/utils/browser-logging';
import { Policy } from '@zinnia/api-types/types/sor';

import { useSelfServeTransactionContext } from './self-serve-transaction-provider';
import {
    SelfServeTransaction,
    SelfServeTransactionSubmitResult,
    ValidationSummaryStatus,
} from './types';
import ProgressBarSteps from '../progress-bar-steps/progress-bar-steps';
import { Step } from '../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import ConfirmStep from './steps/confirm-step/confirm-step';

type SelfServeTransactionContainerProps = {
    initialCustomData: any;
    initialFormData: any;
    transactionType: SelfServeTransaction;
    policy: Policy;
    metaData: FormMetadata;
    parentPage: ParentPage;
    leaveTransactionLink: string;
    processType: Processes;
    processSubType: Processes[];
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
    startStepSubtitle = '',
    submitResponseHandler,
    confirmStepSubtitle,
}: SelfServeTransactionContainerProps) => {
    const { featureFlags } = useOptimizely();

    const { data: casesResponse, isLoading } = useCasesQuery({
        policyNumber: policy.policyNumber,
        process: [processType],
        requestSubType: processSubType,
        enabled: !!policy.policyNumber && !!featureFlags,
    });
    const hasCases =
        Array.isArray(casesResponse?.data) && casesResponse.data.length > 0;
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'selfServeTransaction',
    });

    const getStartStepTitle = useCallback(
        (transactionType: string, t: TFunction) => {
            if (transactionType === SelfServeTransaction.AI_PAPER) {
                return t('aiPaper.title');
            }
            const partyRoleMap: Record<string, string> = {
                ASSIGNEE_CHANGE: 'Assignees',
                PAYEE_CHANGE: 'Payees',
                BENE_CHANGE: 'Beneficiaries',
            };
            const partyRole = partyRoleMap[transactionType] || '';
            return t('start.title', { partyRole });
        },
        []
    );
    const { schemaContent } = metaData;
    const { currentStepIndex, setCurrentStepIndex, goToNext } = useWorkflow();
    const { formData, setFormData } = useSelfServeTransactionContext();
    const [validationSummary, setValidationSummary] = useState<any>(null);
    const [hasValidationErrors, setHasValidationErrors] =
        useState<boolean>(false);
    const [submitEnabled, setSubmitEnabled] = useState<boolean>(true);
    const [submitDisabledStepIndex, setSubmitDisabledStepIndex] = useState<
        number | null
    >(null);

    const steps = useMemo(
        () => schemaContent?.tabSchemas ?? [],
        [schemaContent]
    );

    //adding 2 to steps.length to account for start and confirm step
    const formRefs = useMemo(
        () =>
            Array.from({ length: steps?.length + 2 }).map(() =>
                createRef<Form>()
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
            setSubmitEnabled,
            setSubmitDisabledStepIndex,
        }),
        [formData, setFormData]
    );

    const handleStepContinue = (
        stepTitle: string,
        currentRef: RefObject<Form>
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

    const dynamicSteps: Step[] = steps.map((step, index) => {
        const title = step?.title ?? '';
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
                            disableContinue={
                                hasValidationErrors ||
                                (!submitEnabled &&
                                    submitDisabledStepIndex ===
                                        currentStepIndex)
                            }
                            handleContinue={() =>
                                handleStepContinue(
                                    title,
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
            text: title,
            index: index + 1,
            isCompleted: false,
            screenReaderLabel: title,
            isDisabled: false,
        };
    });

    const startStep: Step = useMemo(
        () => ({
            isVisible: () => hasCases,
            component: (
                <StartStep
                    parentPage={parentPage}
                    policy={policy}
                    state={formData}
                    setState={setFormData}
                    title={getStartStepTitle(transactionType, t)}
                    subtitle={startStepSubtitle}
                    processType={processType}
                    processSubType={processSubType}
                    leaveTransactionLink={leaveTransactionLink}
                />
            ),
            text: getStartStepTitle(transactionType, t),
            index: 0,
            screenReaderLabel: getStartStepTitle(transactionType, t),
        }),
        [
            hasCases,
            parentPage,
            policy,
            formData,
            setFormData,
            transactionType,
            t,
            startStepSubtitle,
            processType,
            processSubType,
            leaveTransactionLink,
            getStartStepTitle,
        ]
    );

    const confirmStep: Step = useMemo(
        () => ({
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
        }),
        [
            formData,
            transactionType,
            submitResponseHandler,
            confirmStepSubtitle,
            t,
            dynamicSteps.length,
        ]
    );

    const allSteps = useMemo(
        () =>
            [startStep, ...dynamicSteps, confirmStep]
                .filter((step) => step.isVisible?.())
                .map((step, idx) => ({ ...step, index: idx })),
        [startStep, dynamicSteps, confirmStep]
    );

    useEffect(() => {
        if (
            !initialFormData ||
            Object.keys(initialFormData).length === 0 ||
            !policy
        )
            return;
        setFormData((prev: any) => {
            return {
                ...prev,
                ...initialFormData,
            };
        });
    }, [initialFormData, setFormData, policy]);
    if (isLoading) {
        return <PageLoader variant={PageLoaderVariant.Center} />;
    }
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
