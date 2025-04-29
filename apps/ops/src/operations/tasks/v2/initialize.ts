
import dayjs from 'dayjs';

import { getOwnerInfo } from '@deps/containers/otp/renewal-forms/components/renewal-form-helper';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helper';
import { TransactionTypes } from '@deps/helpers/transaction-options.helper';
import { DocumentData } from '@deps/models/case/document';
import { Channel } from '@deps/models/case/renewal/case-renewal';
import { CreateTaskBody, RenewalsFormData, TaskSource, TaskType } from '@deps/models/case/task';
import { TaskStatus } from '@deps/models/case/task-instance';
import { ActiveWithdrawalCase, Carrier, DigitalFormData, DigitalFormWithdrawal } from '@deps/models/case/withdrawal/case';
import { ERROR_CODES } from '@deps/pages/create-case/error';
import { getDigitalFormSSR } from '@deps/queries/api/integration';
import { getPolicyPartiesSSR, searchPolicySSR } from '@deps/queries/api/policies';
import { createTaskSSR, getCaseTaskByIdSSR, searchTaskSSR } from '@deps/queries/api/v2/task';
import {
    DEFAULT_DATE_FORMAT,
    DEFAULT_EXTENDED_DATE_FORMAT,
    DEFAULT_EXTENDED_DAY_DATE_FORMAT,
    DEFAULT_EXTENDED_MONTH_DATE_FORMAT,
    ZAHARA_API_DATE_FORMAT,
} from '@deps/types/constants';
import { logError, LoggingContext, logInfo, parseErrorInformation } from '@deps/utils/server-logging';

import { mapTaskToActiveRenewalCaseTask, mapTaskToActiveWithdrawalCaseTask } from './helpers';


export const initializeOTPTaskSSR = async ({
    accessToken,
    caseId,
    clientId,
    contractNumber,
    documentNumber,
    taskType,
    userId,
    getLastSaved,
    taskId,
    action,
    loggingContext: logCtx,
}: {
    caseId: string;
    accessToken: string | undefined;
    clientId: string;
    contractNumber: string;
    documentNumber: string;
    taskType: TaskType;
    userId: string;
    getLastSaved: string;
    taskId?: string;
    action?: string;
    loggingContext: LoggingContext;
}): Promise<ActiveWithdrawalCase | null> => {
    const loggingContext = {
        ...logCtx,
        inputs: {
            caseId,
            clientId,
            contractNumber,
            documentNumber,
            taskType,
            taskId,
            action,
        },
        file: 'operations/tasks/v2/intialize',
        function: 'initializeOTPTaskSSR',
    };
    try {
        logInfo('initializeTaskV2::start', loggingContext);
        if (!caseId || !documentNumber || !clientId || !accessToken) {
            throw new Error('initializeTaskV2::Invalid arguments to initialize a withdrawal task');
        }

        let activeForm;
        if (taskId) {
            activeForm = await getCaseTaskByIdSSR(taskId, accessToken, loggingContext);
            if (activeForm) {
                logInfo('initializeTaskV2::getCaseTaskByIdSSR task active form found', loggingContext);
                if (action === 'readonly' || activeForm.status === TaskStatus.New || activeForm.status === TaskStatus.InProgress) {
                    logInfo('initializeTaskV2::getCaseTaskByIdSSR returining task', { ...loggingContext, taskStatus: activeForm?.status });
                    return mapTaskToActiveWithdrawalCaseTask(activeForm, { ...activeForm?.data, userId });
                }
            }
        }

        const searchResponse = await searchTaskSSR(caseId, accessToken, loggingContext);
        let completedForm;
        if (Array.isArray(searchResponse.data)) {
            const tasks = searchResponse.data;
            const task = tasks.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
            if (task) {
                activeForm = await getCaseTaskByIdSSR(task.id, accessToken, loggingContext);
                if (activeForm) {
                    if (activeForm.status === TaskStatus.New || activeForm.status === TaskStatus.InProgress) {
                        logInfo('initializeTaskV2::active form found', {
                            ...loggingContext,
                            taskId: task.id,
                            taskStatus: activeForm?.status,
                        });
                        return mapTaskToActiveWithdrawalCaseTask(activeForm, { ...activeForm?.data, userId });
                    }
                    if (activeForm.status === TaskStatus.Completed && getLastSaved) {
                        logInfo('initializeTaskV2::completed form found', {
                            ...loggingContext,
                            taskId: task.id,
                            taskStatus: activeForm?.status,
                        });
                        completedForm = mapTaskToActiveWithdrawalCaseTask(activeForm, { ...activeForm?.data, userId });
                    }
                }
            }
        }

        logInfo('initializeTaskV2::Active task not present', loggingContext);
        const digitalForm: DigitalFormWithdrawal | null = await getDigitalFormSSR(
            accessToken,
            {
                contractNumber,
                clientCode: clientId.toUpperCase(),
                source: 'DigitalPortal',
                taskType,
            },
            loggingContext
        );

        if (!digitalForm) {
            logInfo('initializeTaskV2::Digital form not found', loggingContext);
            throw new Error(`initializeTaskV2::Unsuccessful digital form creation for task type ${taskType}`);
        }
        logInfo('initializeTaskV2::Digital form data found', { ...loggingContext, documentNumber, caseId });
        digitalForm.data.documentNumber = documentNumber;
        digitalForm.data.onbaseCaseId = caseId;
        if (getLastSaved && completedForm) {
            logInfo('initializeTaskV2::completed form populated under new task', {
                ...loggingContext,
                getLastSaved,
                documentNumber,
                caseId,
            });
            digitalForm.data.formRequest = { ...completedForm.data.formRequest };
        }
        logInfo('initializeTaskV2::creating a task', loggingContext);
        const body: CreateTaskBody<TaskStatus, DigitalFormData> = {
            source: TaskSource.ZinniaTaskManagement,
            taskType,
            status: TaskStatus.New,
            data: digitalForm.data,
        };
        const caseForm = await createTaskSSR<DigitalFormData>(caseId, accessToken, body, loggingContext);
        if (!caseForm) {
            logInfo('initializeTaskV2::Failed to create a task', loggingContext);
            throw new Error(`initializeTaskV2::Unsuccessful postCaseTasksSSR response for ${taskType}`);
        }
        logInfo('initializeTaskV2::Created task successfully', loggingContext);
        return mapTaskToActiveWithdrawalCaseTask(caseForm, { ...caseForm?.data, userId });
    } catch (e) {
        logError('initializeTaskV2::error', { ...parseErrorInformation(e), ...loggingContext });
        return null;
    }
};

export const initializeRenewalTaskSSR = async ({
    accessToken,
    caseId,
    clientId,
    contractNumber,
    documentNumber,
    taskType,
    userId,
    getLastSaved,
    taskId,
    action,
    loggingContext: logCtx,
    document
}: {
    caseId: string;
    accessToken: string | undefined;
    clientId: string;
    contractNumber: string;
    documentNumber: string;
    taskType: TaskType;
    userId: string;
    getLastSaved: string;
    taskId?: string;
    action?: string;
    loggingContext: LoggingContext;
    document: DocumentData
}): Promise<any | null> => {
    const loggingContext = {
        ...logCtx,
        inputs: {
            caseId,
            clientId,
            contractNumber,
            documentNumber,
            taskType,
            taskId,
            action,
        },
        file: 'operations/tasks/v2/intialize',
        function: 'initializeRenewalTaskSSR',
    };
    try {
        logInfo('initializeRenewalTaskSSR::start', loggingContext);
        if (!caseId || !documentNumber || !clientId || !accessToken) {
            throw new Error('initializeRenewalTaskSSR::Invalid arguments to initialize a task');
        }

        let activeForm;
        if (taskId) {
            activeForm = await getCaseTaskByIdSSR(taskId, accessToken, loggingContext);
            if (activeForm) {
                logInfo('initializeRenewalTaskSSR::getCaseTaskByIdSSR task active form found', loggingContext);
                if (action === 'readonly' || activeForm.status === TaskStatus.New || activeForm.status === TaskStatus.InProgress) {
                    logInfo('initializeRenewalTaskSSR::getCaseTaskByIdSSR returining task', { ...loggingContext, taskStatus: activeForm?.status });
                    return mapTaskToActiveRenewalCaseTask(activeForm, { ...activeForm?.data, userId });
                }
            }
        }

        const searchResponse = await searchTaskSSR(caseId, accessToken, loggingContext);
        let completedForm;
        if (Array.isArray(searchResponse.data)) {
            const tasks = searchResponse.data;
            const task = tasks.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
            if (task) {
                activeForm = await getCaseTaskByIdSSR(task.id, accessToken, loggingContext);
                if (activeForm) {
                    if (activeForm.status === TaskStatus.New || activeForm.status === TaskStatus.InProgress) {
                        logInfo('initializeRenewalTaskSSR::active form found', {
                            ...loggingContext,
                            taskId: task.id,
                            taskStatus: activeForm?.status,
                        });
                        return mapTaskToActiveRenewalCaseTask(activeForm, { ...activeForm?.data, userId });
                    }
                    if (activeForm.status === TaskStatus.Completed && getLastSaved) {
                        logInfo('initializeRenewalTaskSSR::completed form found', {
                            ...loggingContext,
                            taskId: task.id,
                            taskStatus: activeForm?.status,
                        });
                        completedForm = mapTaskToActiveRenewalCaseTask(activeForm, { ...activeForm?.data, userId });
                        logInfo('initializeRenewalTaskSSR::completed form populated under new task', {
                            ...loggingContext,
                            getLastSaved,
                            documentNumber,
                            caseId,
                        });
                        const body: CreateTaskBody<TaskStatus, DigitalFormData> = {
                            source: TaskSource.ZinniaTaskManagement,
                            taskType,
                            status: TaskStatus.New,
                            data: completedForm,
                        };
                        const caseForm = await createTaskSSR<DigitalFormData>(caseId, accessToken, body, loggingContext);
                        if (!caseForm) {
                            logInfo('initializeRenewalTaskSSR::Failed to create a task', loggingContext);
                            throw new Error(`initializeRenewalTaskSSR::Failed to create a task ${taskType}`);
                        }
                        logInfo('initializeRenewalTaskSSR::Created task successfully', loggingContext);
                        return mapTaskToActiveRenewalCaseTask(caseForm, { ...caseForm?.data, userId });
                    }
                }
            }
        }

        logInfo('initializeRenewalTaskSSR::Active task not present. Creating a new task', loggingContext);
        const { parties } = await getPolicyPartyDetails(document, clientId, loggingContext, accessToken);

        const owners = parties.length > 0 ?  parties.filter(party => party?.SrcRoleType === 0) : [];
        const task: CreateTaskBody<TaskStatus, RenewalsFormData> = {
            source: TaskSource.ZinniaTaskManagement,
            taskType: TaskType.RENEWAL_TASK,
            carrier: clientId,
            status: TaskStatus.New,
            data: {
                channel: Channel.Form,
                clientCode: clientId,
                contractNum: document?.contract,
                documentNumber: document?.documentNumber,
                contractValue: null,
                documentReceivedDate: dayjs(document?.documentDate, [
                    DEFAULT_DATE_FORMAT,
                    DEFAULT_EXTENDED_DAY_DATE_FORMAT,
                    DEFAULT_EXTENDED_MONTH_DATE_FORMAT,
                    DEFAULT_EXTENDED_DATE_FORMAT,
                ]).format(ZAHARA_API_DATE_FORMAT),
                goodOrderDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
                lob: document?.lob,
                onbaseCaseId: document?.caseId,
                ownerInformation: getOwnerInfo(owners),
                productName: document?.productName,
                renewalRequestSignDate: '', // need to handle it for FormType
                source: 'SupportTool',
                subsequentGuaranteePeriod: null,
                subsequentTargetFunds: null,
                taskType: 'RenewalTransfer',
                transOption: TransactionTypes.Percentage,
                userId: userId,
            },
        };

        const data = await createTaskSSR<RenewalsFormData>(caseId, accessToken, task, loggingContext);
        if (!data) {
            logInfo('initializeRenewalTaskSSR::Failed to create a task', loggingContext);
            throw new Error(`initializeRenewalTaskSSR::Failed to create a task`);
        }
        logInfo('initializeRenewalTaskSSR::Created new task successfully', { ...loggingContext, taskId:  data.id});
        return mapTaskToActiveRenewalCaseTask(data, { ...data?.data, userId });
    } catch (e) {
        logError('initializeRenewalTaskSSR::error', { ...parseErrorInformation(e), ...loggingContext });
        return null;
    }
};

export const getPolicyPartyDetails = async (document: DocumentData, clientId: string, loggingContext: LoggingContext, accessToken: string | undefined) => {
    let planCode = '';

    try {
        const policies = await searchPolicySSR(document.contract, [clientId?.toUpperCase() as Carrier], accessToken, 1, 0, loggingContext);
        planCode = policies?.[0]?.planCode || '';

        if (isNullEmptyOrUndefined(planCode)) {
            logInfo('getPolicyPartyDetails::Plan code not found', {
                ...loggingContext,
                lob: document?.lob,
            });
            throw Error(ERROR_CODES.RENEWAL_FORM_PLAN_CODE);
        } else {

            logInfo('getPolicyPartyDetails::Plan code found', {
                ...loggingContext,
                lob: document?.lob,
                planCode,
            });
        }

        const parties = document?.contract
            ? await getPolicyPartiesSSR(document?.contract, clientId, accessToken as string, loggingContext)
            : [];


        return {
            parties: Array.isArray(parties) ? parties : [],
            planCode,
        };

    } catch (error) {
        logError('getPolicyPartyDetails::error', { ...parseErrorInformation(error), ...loggingContext });
        throw error;
    }
}