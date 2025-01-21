import Form from '@rjsf/core';
import { useTranslation } from 'next-i18next';
import { createRef, memo, useCallback } from 'react';

import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { FormMetadata } from '@deps/models/case/task';

import { TaskForm } from './task-form';

type TaskFormStepProps = {
    readonly?: boolean;
    formRef?: any;
    taskInfoLink?: string;
    isSubmit?: boolean;
    taskMetadata: FormMetadata;
};

const TaskFormStep = ({ readonly = false, taskInfoLink, isSubmit, taskMetadata }: TaskFormStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: `taskManagement.taskForm` });
    const { goToNext } = useWorkflow();
    const formRef = createRef<Form>();
    const handleStepContinue = useCallback(async () => {
        if (formRef.current) {
            const isValid = formRef.current.validateForm();
            if (isValid) {
                formRef.current.submit();
            }
        }
    }, [formRef]);

    const handleSubmit = useCallback(async () => {
        goToNext();
    }, [goToNext]);

    return (
        <WorkflowCard
            className="!gap-0"
            title={(taskMetadata?.title as string) ?? (t('title') as string)}
            footerContent={
                <TransactionNavigationButtons
                    submitLabel={isSubmit ? (t('submit') as string) : (t('continue') as string)}
                    cancelLabel={t('cancel') as string}
                    isSubmit={true}
                    handleContinue={handleStepContinue}
                    parentPage={ParentPage.CreateCase}
                    leaveTransactionLink={taskInfoLink}
                />
            }
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <TaskForm readonly={readonly} ref={formRef} onSubmit={handleSubmit} isSubmit={isSubmit} taskMetadata={taskMetadata} />
                </div>
            </div>
        </WorkflowCard>
    );
};

export const MemoizedTaskFormStep = memo(TaskFormStep);
