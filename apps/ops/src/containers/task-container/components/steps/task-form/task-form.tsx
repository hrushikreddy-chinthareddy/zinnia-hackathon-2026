import Form, { IChangeEvent } from '@rjsf/core';
import { GenericObjectType, RJSFSchema } from '@rjsf/utils';
import { useTranslation } from 'next-i18next';
import React, {
    ForwardedRef,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import DynamicForm from '@deps/components/dynamic-form/dynamic-form';
import { TranslationFiles } from '@deps/config/translations';
import {
    getUpdatedTaskFromFormData,
    extractFormData,
} from '@deps/containers/task-container/components/steps/task-form/task-form.utils';
import { TaskDataContext } from '@deps/containers/task-container/task-context';
import { updateTask } from '@deps/containers/task-container/task.helpers';
import { FormMetadata, TaskType } from '@deps/models/case/task';
import {
    EntityTypes,
    MatchingCase,
    TransactionData,
} from '@deps/models/case/task/doc-matching-payment';
import { ManagementTask, TaskDocument } from '@deps/models/case/task-instance';
import { getCaseDetails } from '@deps/queries/api/cases';
import { getTransactionsByCorrelationId } from '@deps/queries/api/transactions';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { browserLogError, browserLogWarn } from '@deps/utils/browser-logging';
import { removeFromCache } from '@deps/utils/cache';
import {
    buildTaskPayload,
    cleanForm,
} from '@deps/utils/tasks/task-payload-helpers';

import { applyHiddenFieldPopulation } from './task-form-hidden-field.utils';

type TaskFormProps = {
    readonly: boolean;
    onSubmit: (error: string) => void;
    isSubmit?: boolean;
    taskMetadata: FormMetadata;
    setSubmitEnabled: (enabled: boolean) => void;
    setValidationSummary?: (summary: any) => void;
};

const getPaymentCards = (
    transactions: TransactionData[],
    task: ManagementTask
) => {
    return transactions?.map((transaction) => ({
        label: transaction.correlationId,
        value: transaction.entity.paymentRecordId,
        subElement: {
            ...transaction,
            firstName:
                task?.data?.details?.payerDetails?.firstName ||
                DEFAULT_ERROR_STRING,
            lastName:
                task?.data?.details?.payerDetails?.lastName ||
                DEFAULT_ERROR_STRING,
            title: transaction?.entity?.payment?.companyName,
        },
    }));
};

export const TaskForm = React.forwardRef(function TaskFormComponent(
    {
        readonly,
        onSubmit,
        isSubmit,
        taskMetadata,
        setSubmitEnabled,
        setValidationSummary,
    }: TaskFormProps,
    forwardedRef: ForwardedRef<Form>
) {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: `taskManagement.formErrors`,
    });
    const formState = useContext(TaskDataContext);
    const {
        task,
        setTask,
        setSubmitFailed,
        correlationId,
        initialTask,
        mappedDocuments,
        setMappedDocuments,
    } = formState;
    const [formSchema, setFormSchema] = useState(taskMetadata);
    const prevFormDataRef = useRef<any>(null);

    const [customData, setCustomData] = useState({
        carrier: task.carrier,
        caseId: task.caseId,
        correlationId,
        taskType: task.taskType,
        ...task.data,
        task,
    });

    useEffect(() => {
        if (!customData?.actionData) return;

        setTask((prevTask: any) => ({
            ...prevTask,
            data: {
                ...prevTask.data,

                actionData: customData.actionData,
            },
        }));
    }, [customData?.actionData, setTask]);

    useEffect(() => {
        setCustomData((prev: any) => {
            const { actionData: _ignore, ...safeTaskData } = task.data || {};

            return {
                ...prev,
                ...safeTaskData,
                actionData: prev.actionData,
            };
        });
    }, [task.data]);

    const fetchData = async () => {
        const correlationId = task.data.matchingResult;

        if (
            task.taskType === TaskType.PURCHASE_DOCUMENT_MATCHING ||
            task.taskType === TaskType.Standard_Document_Matching
        ) {
            if (correlationId === MatchingCase.ENTERED && task.data.caseId) {
                try {
                    const matchedCase = await getCaseDetails(task.data.caseId);

                    if (!matchedCase || !matchedCase?.correlationId) {
                        const error = !matchedCase
                            ? 'caseNotFound'
                            : 'correlationIdNotFount';
                        browserLogWarn(`task:: ${t(error)}`, task.data.caseId);
                        onSubmit(t(error));
                        return false;
                    }

                    if (task.taskType === TaskType.Standard_Document_Matching) {
                        setTask((previousTask) => ({
                            ...previousTask,
                            data: {
                                ...previousTask.data,
                                policyNumber:
                                    matchedCase?.additionalData?.policyNumber ||
                                    '',
                            },
                        }));
                        return true;
                    }

                    const transactionResponse =
                        await getTransactionsByCorrelationId(
                            matchedCase?.correlationId || '',
                            {
                                entityType: EntityTypes.NB_PAYMENT_RECORD,
                            }
                        );
                    if (!transactionResponse || !transactionResponse.length) {
                        onSubmit(t('transactionNotFound'));
                        return;
                    }

                    const paymentCards = getPaymentCards(
                        transactionResponse,
                        task
                    );

                    setTask((previousTask) => ({
                        ...previousTask,
                        data: {
                            ...previousTask.data,
                            transactionOptions: paymentCards,
                            zlCaseId: matchedCase.id,
                            policyNumber:
                                matchedCase?.additionalData?.policyNumber || '',
                            matchingResult: matchedCase.correlationId,
                            isDuplicate: MatchingCase.MATCH_FOUND,
                        },
                    }));
                } catch (e) {
                    browserLogError('task-form::fetching transactions', {
                        error: e,
                        payload: {
                            correlationId,
                            taskType: task.taskType,
                            carrier: task.carrier,
                            processType: task.process,
                            taskId: task.id,
                        },
                    });
                    return;
                }
            }
            if (
                ![MatchingCase.ENTERED, MatchingCase.REINDEX].includes(
                    correlationId
                )
            ) {
                try {
                    const response = await getTransactionsByCorrelationId(
                        correlationId,
                        {
                            entityType: EntityTypes.NB_PAYMENT_RECORD,
                        }
                    );

                    const paymentCards = getPaymentCards(response || [], task);

                    setTask((previousTask) => {
                        return {
                            ...previousTask,
                            data: {
                                ...previousTask.data,
                                transactionOptions: paymentCards,
                            },
                        };
                    });
                } catch (e) {
                    browserLogError('task-form::fetching transactions', {
                        error: e,
                        payload: {
                            correlationId,
                            taskType: task.taskType,
                            carrier: task.carrier,
                            processType: task.process,
                            taskId: task.id,
                        },
                    });
                }
            }
        }
    };

    const handleSubmit = useCallback(async () => {
        const isSubmitAction = !readonly || (readonly && isSubmit);
        if (isSubmitAction) {
            if (!isSubmit) {
                await fetchData();
            } else {
                const taskPayload = buildTaskPayload(
                    cleanForm({ ...task, ...customData?.task }, taskMetadata),
                    initialTask
                );
                const success = await updateTask(
                    { ...taskPayload, mappedDocuments },
                    correlationId
                );
                removeFromCache('getTaskInstance', { taskId: task.id });
                setSubmitFailed(!success);
            }
        }
        onSubmit('');
    }, [readonly, isSubmit, correlationId, onSubmit, setSubmitFailed, task]);

    const formOnChangeUpdater: {
        [key in TaskType]?: (formData: any) => any;
    } = {
        [TaskType.Claims_Ops_To_Finance_Escheatment_Trigger]: (
            formData: any
        ) => {
            const updatedFormData = structuredClone(formData);
            const eschDetail =
                updatedFormData.details?.beneOpsEscheatment?.escheatmentDetail;
            const prevEschDetail =
                prevFormDataRef.current?.details?.beneOpsEscheatment
                    ?.escheatmentDetail;
            if (
                prevFormDataRef?.current !== null &&
                (eschDetail?.netDeathBenefit !==
                    prevEschDetail?.netDeathBenefit ||
                    eschDetail?.beneficiary?.beneficiaryPercentage !==
                        prevEschDetail?.beneficiary?.beneficiaryPercentage)
            ) {
                updatedFormData.details.beneOpsEscheatment.escheatmentDetail.beneficiary.beneficiaryDueAmount =
                    undefined;
            }
            prevFormDataRef.current = updatedFormData;
            return updatedFormData;
        },
    };

    const handleChange = useCallback(
        (event: IChangeEvent<any, RJSFSchema, GenericObjectType>) => {
            const { formData } = event;
            const { uiSchema } = formSchema;

            const updatedFormData =
                formOnChangeUpdater[task.taskType as TaskType]?.(formData) ||
                formData;
            const finalFormData = applyHiddenFieldPopulation(
                updatedFormData,
                uiSchema
            );

            const hasDataPathFields = Object.keys(uiSchema).some(
                (field) => uiSchema[field]?.['ui:dataPath']
            );

            if (!hasDataPathFields) {
                setTask((ogTask) => ({
                    ...ogTask,
                    data: finalFormData,
                }));
                return;
            }

            // Otherwise, apply the dataPath mapping logic
            setTask((prevTask) => {
                const updatedTask = getUpdatedTaskFromFormData(
                    prevTask,
                    finalFormData,
                    uiSchema
                );
                return updatedTask;
            });
        },
        [setTask, formSchema]
    );

    const updateSchemaHandler = (dynamicData: any) => {
        Object.keys(dynamicData).forEach((key) => {
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
            setFormSchema((oldSchema) => ({ ...oldSchema, ...currentSchema1 }));
        });
    };

    useEffect(() => {
        const caseSubTypes = task?.data?.caseSubTypeOptions;
        if (caseSubTypes) {
            setFormSchema((prevSchema) => ({
                ...prevSchema,
                formSchema: {
                    ...prevSchema.formSchema,
                    definitions: {
                        ...prevSchema.formSchema.definitions,
                        caseSubTypeEnum: {
                            enum: caseSubTypes
                                ?.split(',')
                                .filter((item: string) => item.trim() !== ''),
                        },
                    },
                },
            }));
        }
    }, [task?.data?.caseSubTypeOptions]);

    useEffect(() => {
        if (TaskType.Standard_Document_Matching === task.taskType) {
            const matchedCase = task?.data?.potentialMatches?.find(
                (match: any) =>
                    match.correlationid === task?.data?.matchingResult
            );
            setTask((ogTask: any) => ({
                ...ogTask,
                data: {
                    ...ogTask.data,
                    matchedCaseId:
                        task?.data?.matchingResult === 'ENTERED'
                            ? task?.data?.caseId
                            : matchedCase
                            ? matchedCase.zlCaseId
                            : null,
                },
            }));
        }
    }, [task?.data?.matchingResult, task?.data?.caseId]);

    useEffect(() => {
        const transactionOptions = task?.data?.transactionOptions;
        if (transactionOptions) {
            setFormSchema((prevSchema) => ({
                ...prevSchema,
                uiSchema: {
                    ...prevSchema.uiSchema,
                    transactions: {
                        ...prevSchema.uiSchema.transactions,
                        'ui:widget': 'radio',
                        'ui:options': {
                            ...((prevSchema.uiSchema.transactions &&
                                prevSchema.uiSchema.transactions[
                                    'ui:options'
                                ]) ||
                                {}),
                            label: false,
                            customOptions: transactionOptions,
                        },
                    },
                },
            }));
        }
    }, [task?.data?.transactionOptions]);

    const memoizedSchema = useMemo(() => formSchema, [formSchema]);

    const handleSetMappedDocuments = (documents: TaskDocument[]) => {
        setMappedDocuments(documents);
    };

    const mergedFormContext = useMemo(
        () => ({
            customData,
            setCustomData: (patch: any) => {
                setCustomData((prev: any) => ({
                    ...prev,
                    task: {
                        ...prev.task,
                        data: { ...prev.task.data, ...patch },
                    },
                }));
            },
            updateSchema: updateSchemaHandler,
            isReadOnlyOverride: readonly,
            mappedDocuments,
            setMappedDocuments: handleSetMappedDocuments,
            setSubmitEnabled,
            setValidationSummary,
        }),
        [
            customData,
            mappedDocuments,
            readonly,
            updateSchemaHandler,
            setSubmitEnabled,
            setValidationSummary,
        ]
    );

    return (
        <DynamicForm
            ref={forwardedRef}
            formData={extractFormData(
                task.data,
                formSchema.uiSchema,
                formSchema.formSchema
            )}
            taskMetadata={memoizedSchema}
            onChange={handleChange}
            onSubmit={handleSubmit}
            readonly={readonly}
            formContext={mergedFormContext}
        ></DynamicForm>
    );
});
