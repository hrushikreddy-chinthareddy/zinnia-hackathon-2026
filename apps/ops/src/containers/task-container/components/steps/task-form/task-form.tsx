import Form, { IChangeEvent } from '@rjsf/core';
import { GenericObjectType, RJSFSchema } from '@rjsf/utils';
import React, { ForwardedRef, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import DynamicForm from '@deps/components/dynamic-form/dynamic-form';
import { TaskDataContext } from '@deps/containers/task-container/task-context';
import { Case } from '@deps/models/case/case';
import { FormMetadata, TaskType } from '@deps/models/case/task';
import { getCases } from '@deps/queries/api/cases';
import { getTransactionsByCorrelationId } from '@deps/queries/api/transactions';
import { buildTaskPayload } from '@deps/utils/tasks/task-payload-helper';

type TaskFormProps = {
    readonly: boolean;
    onSubmit: () => void;
    isSubmit?: boolean;
    taskMetadata: FormMetadata;
};

export const TaskForm = React.forwardRef(function TaskFormComponent(
    { readonly, onSubmit, isSubmit, taskMetadata }: TaskFormProps,
    forwardedRef: ForwardedRef<Form>
) {
    const formState = useContext(TaskDataContext);
    const { task, setTask, setSubmitFailed, correlationId } = formState;
    const [formSchema, setFormSchema] = useState(taskMetadata);
    const fetchData = async () => {
        const correlationId = task.data.potentialMatches;
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
                        setTask(task => ({
                            ...task,
                            data: {
                                ...task.data,
                                caseId: cases[0].id,
                            },
                        }));
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
                        label: transaction.correlationId,
                        value: transaction.recordId,
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
            onSubmit();
            return;
        }

        //todo:vijaya: payload customization

        const taskPayload = buildTaskPayload(task);
        console.log('🚀 ~ handleSubmit ~ taskPayload:Submitted', taskPayload);

        // const success = await updateTask(taskPayload, correlationId);
        // setSubmitFailed(!success);

        onSubmit();
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

    const handleFormDataChange = (data: any) => {
        setTask((task: any) => ({
            ...task,
            data: data,
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
            setFormData={handleFormDataChange}
            taskMetadata={memoizedSchema}
            onChange={handleChange}
            onSubmit={handleSubmit}
            readonly={readonly}
        ></DynamicForm>
    );
});
