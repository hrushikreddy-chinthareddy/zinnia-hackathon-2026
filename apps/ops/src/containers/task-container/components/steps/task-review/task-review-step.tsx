import { convertToCamelCase } from '@zinnia/utils';
import { useTranslation } from 'next-i18next';
import { useCallback, useContext, useState } from 'react';

import { DocumentTypeView } from '@deps/components/side-sheet/documents/DocumentTypeView';
import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { TaskDataContext } from '@deps/containers/task-container/task-context';
import { updateTask } from '@deps/containers/task-container/task.helpers';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { TaskType } from '@deps/models/case/task';

import { TaskReview } from './task-review';

type TaskReviewStepProps = {
    caseId: string;
    taskInfoLink: string;
    taskType: TaskType;
    clientCode: string;
};

export const TaskReviewStep = ({ caseId, clientCode, taskType }: TaskReviewStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: `${convertToCamelCase(taskType)}.taskReview` });
    const { isReadyForDataEntry, task, correlationId, setTask, setSubmitFailed } = useContext(TaskDataContext);

    const [nmDetails, setNmDetails] = useState<{ nmId: string; nmDetails: string } | null>(null);

    const [selectedExceptionDetails, setSelectedExceptionDetails] = useState<string[]>([]);
    const { goToNext } = useWorkflow();

    const handleStepContinue = useCallback(async () => {
        const updatedTask = {
            ...task,
            data: {
                details: task.data?.details || {},
                nigoList: selectedExceptionDetails.map(detail => ({
                    issue: nmDetails?.nmDetails,
                    applicationValue: detail,
                    nmid: nmDetails?.nmId,
                })),
                missingInformation: !isReadyForDataEntry,
            },
        };

        setTask(updatedTask);
        if (isReadyForDataEntry === false) {
            const success = await updateTask(updatedTask, correlationId);
            setSubmitFailed(!success);
        }

        goToNext();
    }, [goToNext, isReadyForDataEntry, nmDetails, selectedExceptionDetails, setTask, task, correlationId]);

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
                    cancelLabel={t('cancel') as string}
                />
            }
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <TaskReview
                        caseId={caseId}
                        taskType={taskType}
                        clientCode={clientCode}
                        activeDocType={DocumentTypeView.Case}
                        setNmDetails={setNmDetails}
                        selectedExceptionDetails={selectedExceptionDetails}
                        setSelectedExceptionDetails={setSelectedExceptionDetails}
                    />
                </div>
            </div>
        </WorkflowCard>
    );
};
