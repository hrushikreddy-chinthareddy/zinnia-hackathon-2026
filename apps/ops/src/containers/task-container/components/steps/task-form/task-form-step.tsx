import Form from '@rjsf/core';
import { AssistiveTextVariant } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import {
    createRef,
    memo,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';

import AssistiveText from '@deps/components/assistive-text/assistive-text';
import PageLoader from '@deps/components/page-loader/page-loader';
import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { TaskDataContext } from '@deps/containers/task-container/task-context';
import { updateTask } from '@deps/containers/task-container/task.helpers';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { FormMetadata } from '@deps/models/case/task';
import { TaskStatus } from '@deps/models/case/task-instance';
import { browserLogError } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

import { TaskForm } from './task-form';

type TaskFormStepProps = {
    readonly?: boolean;
    formRef?: any;
    taskInfoLink?: string;
    isSubmit?: boolean;
    taskMetadata: FormMetadata;
    isSaveAsDraftEnabled?: boolean;
    isContinueButtonEnabled?: boolean;
    stepIndex?: number;
    overrideTitle?: boolean;
};

const TaskFormStep = ({
    readonly = false,
    taskInfoLink,
    isSubmit,
    taskMetadata,
    isSaveAsDraftEnabled = false,
    isContinueButtonEnabled,
    stepIndex,
    overrideTitle = true,
}: TaskFormStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: `taskManagement.taskForm`,
    });
    const { goToNext, setCurrentStepIndex, currentStepIndex } = useWorkflow();
    const formState = useContext(TaskDataContext);
    const { task, correlationId } = formState;
    const formRef = createRef<Form>();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isValidForm, setIsValidForm] = useState(false);
    const [submitEnabled, setSubmitEnabled] = useState(true);
    const [validationSummary, setValidationSummary] = useState<any>(null);

    const handleStepContinue = useCallback(async () => {
        if (formRef.current) {
            const valid = formRef.current.validateForm() || false;
            setIsValidForm(valid);
            const hasValidationErrors =
                validationSummary && validationSummary.status !== 'success';
            if (valid && !hasValidationErrors) {
                formRef.current.submit();
            } else if (hasValidationErrors) {
                setError(t('summaryNigoError') as string);
            }
        }
        if (readonly && !isSubmit) {
            goToNext();
        }
    }, [formRef, readonly, isSubmit, goToNext, validationSummary]);

    useEffect(() => {
        if (!isContinueButtonEnabled) {
            if (formRef.current) {
                setIsValidForm(formRef?.current?.validateForm() || false);
            }
        }
    }, [task.data]);

    const handleSubmit = useCallback(
        async (error: any) => {
            if (error !== '') {
                setError(error);
                setCurrentStepIndex(currentStepIndex - 1);
            } else {
                stepIndex ? setCurrentStepIndex(stepIndex) : goToNext();
            }
        },
        [currentStepIndex, goToNext, setCurrentStepIndex, stepIndex]
    );

    const handleSaveAsDraft = async () => {
        try {
            setLoading(true);
            await updateTask(task, correlationId, TaskStatus.InProgress);
        } catch (error) {
            browserLogError('updateTask::Error updating task', {
                ...parseErrorInformation(error),
                taskId: task.id,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <WorkflowCard
            className="!gap-0"
            title={
                overrideTitle
                    ? taskMetadata?.title ?? (t('title') as string)
                    : (task.taskName || taskMetadata?.title) ??
                      (t('title') as string)
            }
            subtitle={taskMetadata?.description as string}
            footerContent={
                <TransactionNavigationButtons
                    readonly={readonly}
                    submitLabel={
                        isSubmit
                            ? (t('submit') as string)
                            : (t('continue') as string)
                    }
                    cancelLabel={t('cancel') as string}
                    isSubmit={isSubmit}
                    handleContinue={handleStepContinue}
                    handleSaveAsDraft={handleSaveAsDraft}
                    isDraft={isSaveAsDraftEnabled}
                    parentPage={ParentPage.CreateCase}
                    leaveTransactionLink={taskInfoLink}
                    disableContinue={
                        (!isContinueButtonEnabled && !isValidForm) ||
                        !submitEnabled
                    }
                />
            }
        >
            <div className="relative pt-6">
                {loading && (
                    <div className="fixed inset-0 z-50 grid place-content-center bg-white/50">
                        <PageLoader />
                    </div>
                )}
                <div className="flex flex-col gap-4">
                    <TaskForm
                        readonly={readonly}
                        ref={formRef}
                        onSubmit={handleSubmit}
                        setValidationSummary={setValidationSummary}
                        isSubmit={isSubmit}
                        taskMetadata={taskMetadata}
                        setSubmitEnabled={setSubmitEnabled}
                    />
                    {error && (
                        <AssistiveText
                            text={error}
                            variant={AssistiveTextVariant.Error}
                            className="mt-2"
                        />
                    )}
                </div>
            </div>
        </WorkflowCard>
    );
};

export const MemoizedTaskFormStep = memo(TaskFormStep);
