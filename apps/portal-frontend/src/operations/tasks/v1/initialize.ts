import { ActiveWithdrawalCase, CaseStatus } from "@deps/models/case/withdrawal/case";
import { getDigitalFormSSR } from "@deps/queries/api/integration";
import { getCaseTasksSSR, getCaseTasksByIdSSR, postCaseTasksSSR } from "@deps/queries/api/v1/task";
import { logError, logInfo, logTrace, logWarn, parseErrorInformation } from "@deps/utils/server-logging";

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
    taskType: string;
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
        function: 'initializeWithdrawalTaskSSR',
        taskType,
        taskId,
        action,
    };
    try {
        logInfo('initializeWithdrawalTaskSSR::start', loggingContext);
        if (!caseId || !documentNumber || !clientId || !accessToken) {
            throw new Error('initializeWithdrawalTaskSSR::Invalid arguments to initialize a withdrawal task');
        }

        let activeForm;

        if (taskId) {
            activeForm = await getCaseTasksByIdSSR(caseId, taskId, accessToken);
            if (activeForm) {
                logTrace('initializeWithdrawalTaskSSR::getCaseTasksByIdSSR task active form found', loggingContext);

                if (action === 'duplicate') {
                    if (activeForm.status === CaseStatus.Submit) {
                        activeForm.status = CaseStatus.Draft;
                        activeForm.taskId = '';

                        logTrace('initializeWithdrawalTaskSSR::duplicating task', loggingContext);
                        const caseForm = await postCaseTasksSSR(caseId, activeForm, accessToken);
                        if (!caseForm) {
                            logTrace('initializeWithdrawalTaskSSR::Failed to duplicate task', loggingContext);
                            throw new Error(`initializeWithdrawalTaskSSR::Unsuccessful postCaseTasksSSR response for ${taskType}`);
                        }
                        logTrace('initializeWithdrawalTaskSSR::Duplicate task success. Task ID:' + caseForm.taskId, loggingContext);
                        return { ...caseForm, data: { ...caseForm?.data, userId } };
                    }
                } else if (action === 'readonly') {
                    logTrace('initializeWithdrawalTaskSSR::active form found for readonly action', loggingContext);
                    return { ...activeForm, data: { ...activeForm.data, userId } };
                }
            }
        }

        logTrace('initializeWithdrawalTaskSSR::getCaseTasksSSR', loggingContext);
        const tasks = await getCaseTasksSSR(caseId, accessToken, {
            status: CaseStatus.Pending,
            taskType,
        });

        activeForm = tasks.find(task => task.taskType === taskType && task.status === 'PENDING');
        if (activeForm) {
            logTrace('initializeWithdrawalTaskSSR::active form found', loggingContext);
            return { ...activeForm, data: { ...activeForm.data, userId } };
        }

        logTrace('initializeWithdrawalTaskSSR::no active form', loggingContext);
        const digitalForm = await getDigitalFormSSR(accessToken, {
            contractNumber, // contract (from document);
            clientCode: clientId.toUpperCase(),
            source: 'DigitalPortal',
            taskType,
        });

        if (!digitalForm) {
            logWarn('initializeWithdrawalTaskSSR::no digital form', loggingContext);
            throw new Error(`initializeWithdrawalTaskSSR::Unsuccessful digital form creation for task type ${taskType}`);
        }
        digitalForm.data.documentNumber = documentNumber;
        digitalForm.data.onbaseCaseId = caseId;

        logTrace('initializeWithdrawalTaskSSR::postCaseTasksSSR', loggingContext);
        const caseForm = await postCaseTasksSSR(caseId, digitalForm, accessToken);
        if (!caseForm) {
            logWarn('initializeWithdrawalTaskSSR::no case form', loggingContext);
            throw new Error(`initializeWithdrawalTaskSSR::Unsuccessful postCaseTasksSSR response for ${taskType}`);
        }
        return { ...caseForm, data: { ...caseForm?.data, userId } };
    } catch (e) {
        logError('initializeWithdrawalTaskSSR', { ...parseErrorInformation(e), ...loggingContext });
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
    taskType: string;
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
        function: 'initializeOtpTaskSSR',
        taskType,
        taskId,
        action,
    };
    try {
        logInfo('initializeOtpTaskSSR::start', loggingContext);
        if (!caseId || !documentNumber || !clientId || !accessToken) {
            throw new Error('initializeOtpTaskSSR::Invalid arguments to initialize a withdrawal task');
        }

        logTrace('initializeOtpTaskSSR::getCaseTasksSSR', loggingContext);

        let activeForm;
        if (taskId) {
            activeForm = await getCaseTasksByIdSSR(caseId, taskId, accessToken);
            if (activeForm) {
                logTrace('initializeOtpTaskSSR::getCaseTasksByIdSSR task active form found', loggingContext);
                if (action === 'readonly' || action === '') {
                    return { ...activeForm, data: { ...activeForm.data, userId } };
                }
            }
        }

        const requestBody: { taskType: string; status?: CaseStatus } = {
            taskType,
        };

        if (!getLastSaved) {
            requestBody.status = CaseStatus.Pending;
        }

        if (action === 'new') {
            requestBody.status = CaseStatus.Draft;
        }

        const tasks = await getCaseTasksSSR(caseId, accessToken, requestBody);
        if (tasks.length > 0) {
            // get the latest updated task
            activeForm = tasks.sort((a, b) => b.updatedDate.localeCompare(a.updatedDate))[0];
            switch (activeForm.status) {
                case CaseStatus.Pending:
                    logTrace('initializeOtpTaskSSR::active pending form found', loggingContext);
                    return { ...activeForm, data: { ...activeForm.data, userId } };
                case CaseStatus.Submit:
                    logTrace('initializeOtpTaskSSR::active in-progress form found', loggingContext);
                    activeForm = { ...activeForm, data: { ...activeForm.data, userId } };
                    break;
            }
        } else {
            logTrace('initializeOtpTaskSSR::no active form', loggingContext);
            activeForm = await getDigitalFormSSR(accessToken, {
                contractNumber, // contract (from document);
                clientCode: clientId.toUpperCase(),
                source: 'DigitalPortal',
                taskType,
            });

            if (!activeForm) {
                logWarn('initializeOtpTaskSSR::no digital form', loggingContext);
                throw new Error(`initializeOtpTaskSSR::Unsuccessful digital form creation for task type ${taskType}`);
            }

            activeForm.data.documentNumber = documentNumber;
            activeForm.data.onbaseCaseId = caseId;
        }

        logTrace('initializeOtpTaskSSR::postCaseTasksSSR', loggingContext);
        const caseForm = await postCaseTasksSSR(caseId, activeForm, accessToken);

        if (!caseForm) {
            logWarn('initializeOtpTaskSSR::no case form', loggingContext);
            throw new Error(`initializeOtpTaskSSR::Unsuccessful postCaseTasksSSR response for ${taskType}`);
        }
        return { ...caseForm, data: { ...caseForm?.data, userId } };
    } catch (e) {
        logError('initializeOtpTaskSSR', { ...parseErrorInformation(e), ...loggingContext });
        return null;
    }
};