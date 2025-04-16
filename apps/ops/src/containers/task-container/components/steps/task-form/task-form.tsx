import Form, { IChangeEvent } from '@rjsf/core';
import { GenericObjectType, RJSFSchema } from '@rjsf/utils';
import { useTranslation } from 'next-i18next';
import React, { ForwardedRef, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import DynamicForm from '@deps/components/dynamic-form/dynamic-form';
import { TranslationFiles } from '@deps/config/translations';
import { getUpdatedTaskFromFormData, extractFormData } from '@deps/containers/task-container/components/steps/task-form/task-form.utils';
import { TaskDataContext } from '@deps/containers/task-container/task-context';
import { updateTask } from '@deps/containers/task-container/task.helper';
import { FormMetadata, TaskType } from '@deps/models/case/task';
import { EntityTypes, MatchingCase, TransactionData } from '@deps/models/case/task/doc-matching-payment';
import { ManagementTask } from '@deps/models/case/task-instance';
import { getCaseDetails } from '@deps/queries/api/cases';
import { getTransactionsByCorrelationId } from '@deps/queries/api/transactions';
import { browserLogWarn } from '@deps/utils/browser-logging';
import { removeFromCache } from '@deps/utils/cache';
import { buildTaskPayload, cleanForm } from '@deps/utils/tasks/task-payload-helper';

type TaskFormProps = {
    readonly: boolean;
    onSubmit: (error: string) => void;
    isSubmit?: boolean;
    taskMetadata: FormMetadata;
};

const getPaymentCards = (transactions: TransactionData[], task: ManagementTask) => {
    return transactions?.map(transaction => ({
        label: transaction.correlationId,
        value: transaction.entity.paymentRecordId,
        subElement: {
            ...transaction,
            firstName: task?.data?.details?.payerDetails?.firstName || '',
            lastName: task?.data?.details?.payerDetails?.lastName || '',
            title: transaction?.entity?.payment?.companyName,
        },
    }));
};

export const TaskForm = React.forwardRef(function TaskFormComponent(
    { readonly, onSubmit, isSubmit, taskMetadata }: TaskFormProps,
    forwardedRef: ForwardedRef<Form>
) {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: `taskManagement.formErrors` });
    const formState = useContext(TaskDataContext);
    const { task, setTask, setSubmitFailed, correlationId, initialTask } = formState;
    const [formSchema, setFormSchema] = useState(taskMetadata);
    const formContext = { carrier: task.carrier, caseId: task.caseId, taskType: task.taskType, correlationId: correlationId };
    const fetchData = async () => {
        const correlationId = task.data.matchingResult;

        if (task.taskType === TaskType.PURCHASE_DOCUMENT_MATCHING || task.taskType === TaskType.Standard_Document_Matching) {
            if (correlationId === MatchingCase.ENTERED && task.data.caseId) {
                try {
                    const matchedCase = await getCaseDetails(task.data.caseId);

                    if (!matchedCase || !matchedCase?.correlationId) {
                        const error = !matchedCase ? 'caseNotFound' : 'correlationIdNotFount';
                        browserLogWarn(`task:: ${t(error)}`, task.data.caseId);
                        onSubmit(t(error));
                        return false;
                    }

                    if (task.taskType === TaskType.Standard_Document_Matching) {
                        setTask(previousTask => ({
                            ...previousTask,
                            data: {
                                ...previousTask.data,
                                policyNumber: matchedCase?.additionalData?.policyNumber || '',
                            },
                        }));
                        return true;
                    }

                    const transactionResponse = await getTransactionsByCorrelationId(matchedCase?.correlationId || '', {
                        entityType: EntityTypes.NB_PAYMENT_RECORD,
                    });
                    if (!transactionResponse || !transactionResponse.length) {
                        onSubmit(t('transactionNotFound'));
                        return;
                    }

                    const paymentCards = getPaymentCards(transactionResponse, task);

                    setTask(previousTask => ({
                        ...previousTask,
                        data: {
                            ...previousTask.data,
                            transactionOptions: paymentCards,
                            zlCaseId: matchedCase.id,
                            policyNumber: matchedCase?.additionalData?.policyNumber || '',
                            matchingResult: matchedCase.correlationId,
                            isDuplicate: MatchingCase.MATCH_FOUND,
                        },
                    }));
                } catch (e) {
                    console.log(e);
                    return;
                }
            }
            if (![MatchingCase.ENTERED, MatchingCase.REINDEX].includes(correlationId)) {
                try {
                    const response = await getTransactionsByCorrelationId(correlationId, {
                        entityType: EntityTypes.NB_PAYMENT_RECORD,
                    });

                    const paymentCards = getPaymentCards(response || [], task);

                    setTask(previousTask => {
                        return {
                            ...previousTask,
                            data: {
                                ...previousTask.data,
                                transactionOptions: paymentCards,
                            },
                        };
                    });
                } catch (e) {
                    console.log(e);
                }
            }
        }
    };

    const handleSubmit = useCallback(async () => {
        if (!isSubmit) {
            await fetchData();
            onSubmit('');
            return;
        }

        const taskPayload = buildTaskPayload(cleanForm(task, taskMetadata), initialTask);
        const success = await updateTask(taskPayload, correlationId);

        removeFromCache('getTaskInstance', { taskId: task.id });
        setSubmitFailed(!success);

        onSubmit('');
    }, [correlationId, isSubmit, onSubmit, setSubmitFailed, task]);

    const handleChange = useCallback(
        (event: IChangeEvent<any, RJSFSchema, GenericObjectType>) => {
            const { formData } = event;
            const { uiSchema } = formSchema;
            const hasDataPathFields = Object.keys(uiSchema).some(field => uiSchema[field]?.['ui:dataPath']);

            if (!hasDataPathFields) {
                setTask(ogTask => ({
                    ...ogTask,
                    data: event.formData,
                }));
                return;
            }

            // Otherwise, apply the dataPath mapping logic
            setTask(prevTask => {
                const updatedTask = getUpdatedTaskFromFormData(prevTask, formData, uiSchema);
                return updatedTask;
            });
        },
        [setTask, task]
    );

    const setFormContext = (dynamicData: any) => {
        setTask((ogTask: any) => ({
            ...ogTask,
            data: {
                ...ogTask.data,
                ...dynamicData,
            },
        }));
    };

    const updateSchemaHandler = (dynamicData: any) => {
        Object.keys(dynamicData).forEach(key => {
            const currentSchema1 = {
                ...formSchema,
                formSchema: {
                    ...formSchema.formSchema,
                    definitions: {
                        ...formSchema.formSchema.definitions,
                        [key]: { ...dynamicData[key] },
                    },
                },
            };
            setFormSchema(oldSchema => ({ ...oldSchema, ...currentSchema1 }));
        });
    };

    useEffect(() => {
        const caseSubTypes = task?.data?.caseSubTypeOptions;
        if (caseSubTypes) {
            setFormSchema(prevSchema => ({
                ...prevSchema,
                formSchema: {
                    ...prevSchema.formSchema,
                    definitions: {
                        ...prevSchema.formSchema.definitions,
                        caseSubTypeEnum: {
                            enum: caseSubTypes?.split(',').filter((item: string) => item.trim() !== ''),
                        },
                    },
                },
            }));
        }
    }, [task?.data?.caseSubTypeOptions]);

    useEffect(() => {
        if (TaskType.Standard_Document_Matching === task.taskType) {
            const matchedCase = task?.data?.potentialMatches?.find((match: any) => match.correlationid === task?.data?.matchingResult);
            setTask((ogTask: any) => ({
                ...ogTask,
                data: {
                    ...ogTask.data,
                    matchedCaseId:
                        task?.data?.matchingResult === 'ENTERED' ? task?.data?.caseId : matchedCase ? matchedCase.zlCaseId : null,
                },
            }));
        }
    }, [task?.data?.matchingResult, task?.data?.caseId]);

    useEffect(() => {
        const transactionOptions = task?.data?.transactionOptions;
        if (transactionOptions) {
            setFormSchema(prevSchema => ({
                ...prevSchema,
                uiSchema: {
                    ...prevSchema.uiSchema,
                    transactions: {
                        ...prevSchema.uiSchema.transactions,
                        'ui:widget': 'radio',
                        'ui:options': {
                            ...((prevSchema.uiSchema.transactions && prevSchema.uiSchema.transactions['ui:options']) || {}),
                            label: false,
                            customOptions: transactionOptions,
                        },
                    },
                },
            }));
        }
    }, [task?.data?.transactionOptions]);

    const memoizedSchema = useMemo(() => formSchema, [formSchema]);

    return (
        <DynamicForm
            ref={forwardedRef}
            formData={extractFormData(task.data, formSchema.uiSchema, formSchema.formSchema)}
            taskMetadata={memoizedSchema}
            onChange={handleChange}
            onSubmit={handleSubmit}
            readonly={readonly}
            formContext={{
                customData: { ...formContext, ...task.data, task },
                setCustomData: setFormContext,
                updateSchema: updateSchemaHandler,
            }}
        ></DynamicForm>
    );
});
