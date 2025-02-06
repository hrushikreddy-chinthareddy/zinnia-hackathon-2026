import { CreateTaskBody, TaskSource, TaskType } from '@deps/models/case/task';
import { TaskStatus } from '@deps/models/case/task-instance';
import { ActiveWithdrawalCase, DigitalFormData, DigitalFormWithdrawal } from '@deps/models/case/withdrawal/case';
import { getDigitalFormSSR } from '@deps/queries/api/integration';
import { createTaskSSR, getCaseTaskByIdSSR, searchTaskSSR } from '@deps/queries/api/v2/task';
import { logError, logInfo, parseErrorInformation } from '@deps/utils/server-logging';

import { mapTaskToActiveWithdrawalCaseTask } from './helpers';

export const initializeWithdrawalTaskSSR = async ({
    accessToken,
    caseId,
    clientId,
    contractNumber,
    documentNumber,
    taskType,
    userId,
    taskId,
    action,
}: {
    caseId: string;
    accessToken: string | undefined;
    clientId: string;
    contractNumber: string;
    documentNumber: string;
    taskType: TaskType;
    userId: string;
    taskId?: string;
    action?: string;
}): Promise<ActiveWithdrawalCase | null> => {
    const loggingContext = {
        caseId,
        clientId,
        contractNumber,
        documentNumber,
        file: 'queries/api/cases',
        function: 'initializeTaskV2',
        taskType,
        taskId,
        action,
    };
    try {
        logInfo('initializeTaskV2::start', loggingContext);
        if (!caseId || !documentNumber || !clientId || !accessToken) {
            throw new Error('initializeTaskV2::Invalid arguments to initialize a withdrawal task');
        }

        let activeForm;
        if (taskId) {
            activeForm = await getCaseTaskByIdSSR(taskId, accessToken);
            if (activeForm) {
                logInfo('initializeTaskV2::getCaseTaskByIdSSR task active form found', loggingContext);
                if (action === 'readonly' || activeForm.status === TaskStatus.New) {
                    return mapTaskToActiveWithdrawalCaseTask(activeForm, { ...activeForm?.data, userId });
                }
            }
        }

        const searchResponse = await searchTaskSSR(caseId, accessToken);
        if (Array.isArray(searchResponse.data)) {
            const tasks = searchResponse.data;
            const task = tasks.find(task => task.taskType === taskType && task.status === TaskStatus.New);
            if (task) {
                activeForm = await getCaseTaskByIdSSR(task.id, accessToken);
                if (activeForm) {
                    logInfo('initializeTaskV2::active form found', loggingContext);
                    return mapTaskToActiveWithdrawalCaseTask(activeForm, { ...activeForm?.data, userId });
                }
            }
        }

        logInfo('initializeTaskV2::no active form', loggingContext);
        const digitalForm: DigitalFormWithdrawal | null = await getDigitalFormSSR(accessToken, {
            contractNumber,
            clientCode: clientId.toUpperCase(),
            source: 'DigitalPortal',
            taskType,
        });

        if (!digitalForm) {
            logInfo('initializeTaskV2::no digital form', loggingContext);
            throw new Error(`initializeTaskV2::Unsuccessful digital form creation for task type ${taskType}`);
        }
        digitalForm.data.documentNumber = documentNumber;
        digitalForm.data.onbaseCaseId = caseId;

        logInfo('initializeTaskV2::postCaseTasksSSR', loggingContext);
        const body: CreateTaskBody<TaskStatus, DigitalFormData>  = {
            source: TaskSource.ZinniaTaskManagement,
            taskType,
            status: TaskStatus.New,
            data: digitalForm.data,
        };

        const caseForm = await createTaskSSR<DigitalFormData>(caseId, accessToken, body);
        if (!caseForm) {
            logInfo('initializeTaskV2::no case form', loggingContext);
            throw new Error(`initializeTaskV2::Unsuccessful postCaseTasksSSR response for ${taskType}`);
        }
        return mapTaskToActiveWithdrawalCaseTask(caseForm, { ...caseForm?.data, userId });
    } catch (e) {
        logError('initializeTaskV2', { ...parseErrorInformation(e), ...loggingContext });
        return null;
    }
};

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
}): Promise<ActiveWithdrawalCase | null> => {
    const loggingContext = {
        caseId,
        clientId,
        contractNumber,
        documentNumber,
        file: 'queries/api/cases',
        function: 'initializeTaskV2',
        taskType,
        taskId,
        action,
    };
    try {
        logInfo('initializeTaskV2::start', loggingContext);
        if (!caseId || !documentNumber || !clientId || !accessToken) {
            throw new Error('initializeTaskV2::Invalid arguments to initialize a withdrawal task');
        }

        let activeForm;
        if (taskId) {
            activeForm = await getCaseTaskByIdSSR(taskId, accessToken);
            if (activeForm) {
                logInfo('initializeTaskV2::getCaseTaskByIdSSR task active form found', loggingContext);
                if (action === 'readonly' || (activeForm.status === TaskStatus.New || activeForm.status === TaskStatus.InProgress)) {
                    return mapTaskToActiveWithdrawalCaseTask(activeForm, { ...activeForm?.data, userId });
                }
            }
        }

        const searchResponse = await searchTaskSSR(caseId, accessToken);
        let completedForm;
        if (Array.isArray(searchResponse.data)) {
            const tasks = searchResponse.data;
            const task = tasks.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
            if (task) {
                activeForm = await getCaseTaskByIdSSR(task.id, accessToken);
                if (activeForm) {
                    if (activeForm.status === TaskStatus.New || activeForm.status === TaskStatus.InProgress) {
                        logInfo('initializeTaskV2::active form found', { ...loggingContext, taskId: task.id });
                        return mapTaskToActiveWithdrawalCaseTask(activeForm, { ...activeForm?.data, userId });
                    }
                    if (activeForm.status === TaskStatus.Completed && getLastSaved) {
                        logInfo('initializeTaskV2::completed form found', { ...loggingContext, taskId: task.id });
                        completedForm = mapTaskToActiveWithdrawalCaseTask(activeForm, { ...activeForm?.data, userId });
                    }
                }
            }
        }

        logInfo('initializeTaskV2::Active task not present', loggingContext);
        const digitalForm: DigitalFormWithdrawal | null = await getDigitalFormSSR(accessToken, {
            contractNumber,
            clientCode: clientId.toUpperCase(),
            source: 'DigitalPortal',
            taskType,
        });

        if (!digitalForm) {
            logInfo('initializeTaskV2::Digital form not found', loggingContext);
            throw new Error(`initializeTaskV2::Unsuccessful digital form creation for task type ${taskType}`);
        }
        logInfo('initializeTaskV2::Digital form data found', loggingContext);
        digitalForm.data.documentNumber = documentNumber;
        digitalForm.data.onbaseCaseId = caseId;
        if (getLastSaved && completedForm) {
            logInfo('initializeTaskV2::completed form populated under new task', {...loggingContext, getLastSaved });
            digitalForm.data.formRequest = { ...completedForm.data.formRequest};
        }
        logInfo('initializeTaskV2::creating a task', loggingContext);
        const body: CreateTaskBody<TaskStatus, DigitalFormData>  = {
            source: TaskSource.ZinniaTaskManagement,
            taskType,
            status: TaskStatus.New,
            data: digitalForm.data,
        };
        const caseForm = await createTaskSSR<DigitalFormData>(caseId, accessToken, body);
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
