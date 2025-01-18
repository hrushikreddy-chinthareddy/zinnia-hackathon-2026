import Form from '@rjsf/core';
import { useTranslation } from 'next-i18next';
import { createRef, memo, useCallback, useContext } from 'react';

import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { TaskDataContext } from '@deps/containers/task-container/task-context';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { Case } from '@deps/models/case/case';
import { FormMetadata, TaskType } from '@deps/models/case/task';
import { getCases } from '@deps/queries/api/cases';
import { getTransactionsByCorrelationId } from '@deps/queries/api/transactions';

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
    const { task, setTask } = useContext(TaskDataContext);
    const handleStepContinue = useCallback(async () => {
        const correlationId = task.data.potentialMatches;

        const validForm = async () => {
            if (task.taskType === TaskType.PURCHASE_DOCUMENT_MATCHING) {
                if (correlationId === 'enterCaseId' && task.data.caseId) {
                    try {
                        const caseRequestBody = {
                            caseIds: [task.data.caseId],
                            notInCaseStatus: [],
                            limit: 25,
                            offset: 0,
                            sortDirection: 'desc',
                            sortBy: 'createdAt',
                        };
                        const response = await getCases(caseRequestBody);
                        const cases = response.data as Case[];

                        if (cases.length > 0) {
                            setTask({
                                ...task,
                                data: {
                                    ...task.data,
                                    caseId: cases[0].id,
                                },
                            });
                        }
                    } catch (e) {
                        console.log(e);
                    }
                }
                if (!['enterCaseId', 'notMatched'].includes(correlationId)) {
                    try {
                        const response = await getTransactionsByCorrelationId(correlationId, {
                            entityType: 'NB_PAYMENT_RECORD',
                        });

                        const paymentCards = response?.map((transaction: any) => ({
                            correlationId: transaction.correlationId,
                            recordId: transaction.recordId,
                        }));

                        await new Promise<void>(resolve => {
                            setTask({
                                ...task,
                                data: {
                                    ...task.data,
                                    transactions: paymentCards,
                                },
                            });
                            resolve();
                        });
                    } catch (e) {
                        console.log(e);
                    }
                }
            }
        };

        await validForm();

        const isValid = formRef.current?.validateForm();
        if (isValid) {
            formRef.current?.submit();
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
