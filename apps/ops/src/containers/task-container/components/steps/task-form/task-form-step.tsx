import Form from '@rjsf/core';
import { useTranslation } from 'next-i18next';
import { createRef, memo, useCallback } from 'react';

import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { TaskType } from '@deps/models/case/task';
import { convertToCamelCase } from '@deps/utils/string.utils';

import { TaskForm } from './task-form';

type TaskFormStepProps = {
    isSummaryView?: boolean;
    formRef?: any;
    taskInfoLink?: string;
    taskType: TaskType;
};

const TaskFormStep = ({ taskType, isSummaryView = false, taskInfoLink }: TaskFormStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: `${convertToCamelCase(taskType)}.taskReview` });
    const { goToNext } = useWorkflow();
    const formRef = createRef<Form>();

    const handleStepContinue = useCallback(() => {
        const isValid = formRef.current?.validateForm();
        if (isValid) {
            formRef.current?.submit();
        }
    }, [formRef]);

    const handleSubmit = useCallback(() => {
        goToNext();
    }, [goToNext]);

    return (
        <WorkflowCard
            className="!gap-0"
            title={t('title')}
            subtitle={t('subTitle') as string}
            footerContent={
                <TransactionNavigationButtons
                    className="!gap-0"
                    handleContinue={handleStepContinue}
                    parentPage={ParentPage.CreateCase}
                    leaveTransactionLink={taskInfoLink}
                />
            }
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <TaskForm isSummaryView={isSummaryView} ref={formRef} onSubmit={handleSubmit} />
                </div>
            </div>
        </WorkflowCard>
    );
};
export const MemoizedTaskFormStep = memo(TaskFormStep);
