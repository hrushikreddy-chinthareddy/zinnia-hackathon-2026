import { convertToCamelCase } from '@zinnia/utils';
import { useTranslation } from 'next-i18next';
import { useCallback } from 'react';

import { DocumentTypeView } from '@deps/components/side-sheet/documents/documents-content';
import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { TaskType } from '@deps/models/case/task';

import { TaskReview } from './task-review';

type TaskReviewStepProps = {
    caseId: string;
    documentNumber: string;
    taskInfoLink: string;
    taskType: TaskType;
    clientCode: string;
    docType: string;
};

export const TaskReviewStep = ({ caseId, documentNumber, clientCode, docType, taskType }: TaskReviewStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: `${convertToCamelCase(taskType)}.taskReview` });

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
                    leaveTransactionLink="/create-case"
                    cancelLabel={t('cancelLabel') as string}
                />
            }
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <TaskReview
                        caseId={caseId}
                        documentNumber={documentNumber}
                        taskType={taskType}
                        clientCode={clientCode}
                        docType={docType}
                        activeDocType={DocumentTypeView.Case}
                    />
                </div>
            </div>
        </WorkflowCard>
    );
};
