import { useTranslation } from 'next-i18next';
import { useCallback } from 'react';

import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';

import { TaskForm } from './task-form';

interface TaskFormStepProps {
    isSummaryView?: boolean;
    formRef?: any;
    taskInfoLink: string;
}

export const TaskFormStep = ({ isSummaryView = false, taskInfoLink }: TaskFormStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'suitability.taskReview' });
    const { goToNext } = useWorkflow();

    const handleStepContinue = useCallback(() => {
        goToNext();
    }, [goToNext]);

    return (
        <WorkflowCard
            title={t('title')}
            subtitle={t('subTitle') as string}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-4"
                    handleContinue={handleStepContinue}
                    parentPage={ParentPage.CreateCase}
                    leaveTransactionLink={taskInfoLink}
                />
            }
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <TaskForm isSummaryView={isSummaryView} />
                </div>
            </div>
        </WorkflowCard>
    );
};
