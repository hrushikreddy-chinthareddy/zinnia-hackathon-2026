import Form, { IChangeEvent } from '@rjsf/core';
import { GenericObjectType, RJSFSchema } from '@rjsf/utils';
import { useTranslation } from 'next-i18next';
import React, { ForwardedRef, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import DynamicForm from '@deps/components/dynamic-form/dynamic-form';
import { TranslationFiles } from '@deps/config/translations';
import { TaskDataContext } from '@deps/containers/task-container/task-context';
import { Case } from '@deps/models/case/case';
import { FormMetadata, TaskType } from '@deps/models/case/task';
import { EntityTypes, MatchingCase } from '@deps/models/case/task/doc-matching-payment';
import { getCases } from '@deps/queries/api/cases';
import { getTransactionsByCorrelationId } from '@deps/queries/api/transactions';
import { browserLogWarn } from '@deps/utils/browser-logging';
import { buildTaskPayload } from '@deps/utils/tasks/task-payload-helper';

type TaskFormProps = {
    readonly: boolean;
    onSubmit: (error: string) => void;
    isSubmit?: boolean;
    taskMetadata: FormMetadata;
};

export const TaskForm = React.forwardRef(function TaskFormComponent(
    { readonly, onSubmit, isSubmit, taskMetadata }: TaskFormProps,
    forwardedRef: ForwardedRef<Form>
) {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: `taskManagement.formErrors` });
    const formState = useContext(TaskDataContext);
    const { task, setTask, setSubmitFailed, correlationId, initialTask } = formState;
    const [formSchema, setFormSchema] = useState(taskMetadata);
    const formContext = { carrier: task.carrier, caseId: task.caseId, taskType: task.taskType };
    const fetchData = async () => {
        const correlationId = task.data.matchingResult;
        if (task.taskType === TaskType.PURCHASE_DOCUMENT_MATCHING) {
            if (correlationId === MatchingCase.ENTERED && task.data.caseId) {
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

                    if (!cases.length || !cases?.[0]?.correlationId) {
                        const error = !cases.length ? 'caseNotFound' : 'correlationIdNotFount';
                        browserLogWarn(`task:: ${t(error)}`, task.data.caseId);
                        onSubmit(t(error));
                        return;
                    }

                    const transactionResponse = await getTransactionsByCorrelationId(cases?.[0]?.correlationId || '', {
                        entityType: EntityTypes.NB_PAYMENT_RECORD,
                    });
                    if (!transactionResponse || !transactionResponse.length) {
                        onSubmit(t('transactionNotFound'));
                        return;
                    }

                    const paymentCards = transactionResponse?.map((transaction: any) => ({
                        label: transaction.correlationId,
                        value: transaction.entity.paymentRecordId,
                        subElement: {
                            ...transaction,
                            title: transaction?.entity?.payment?.companyName,
                        },
                    }));

                    setTask(previousTask => ({
                        ...previousTask,
                        data: {
                            ...previousTask.data,
                            transactionOptions: paymentCards,
                            caseId: cases[0].id,
                            matchingResult: cases[0].correlationId,
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

                    const paymentCards = response?.map((transaction: any) => ({
                        label: transaction.correlationId,
                        value: transaction.entity.paymentRecordId,
                        subElement: {
                            ...transaction,
                            title: transaction?.entity?.payment?.companyName,
                        },
                    }));

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

        const taskPayload = buildTaskPayload(task, initialTask);

        // const success = await updateTask(taskPayload, correlationId);
        // setSubmitFailed(!success);

        onSubmit('');
    }, [correlationId, isSubmit, onSubmit, setSubmitFailed, task]);

    const handleChange = useCallback(
        (event: IChangeEvent<any, RJSFSchema, GenericObjectType>) => {
            setTask({
                ...task,

                data: event.formData,
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
            formData={task.data}
            taskMetadata={memoizedSchema}
            onChange={handleChange}
            onSubmit={handleSubmit}
            readonly={readonly}
            formContext={{ customData: { ...formContext, ...task.data }, setCustomData: setFormContext }}
        ></DynamicForm>
    );
});
