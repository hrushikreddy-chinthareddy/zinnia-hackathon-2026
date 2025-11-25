import { AxiosResponse } from 'axios';

import { BeneChangePayload } from '@deps/contexts/BeneChangeContext';
import { baseAppUrl, apiServerBaseUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import {
    logError,
    LoggingContext,
    logInfo,
    parseErrorInformation,
} from '@deps/utils/server-logging';

import { TransactionResponse, TransactionSubmitResponse } from './bpm';
import { serverApi } from '../api-utils/serverApiClient';
const baseUrl = `${baseAppUrl}/api/webnonfinancial/nonfinancial/v1`;
const claimUrl = `${baseAppUrl}/api/webnonfinancial/claim/v1`;

export const addTransaction = async (body: any): Promise<any> => {
    const { businessKey, correlationid, carrierId, policyNumber } = body || {};

    try {
        browserLogInfo('webNonFinancial::Adding a transaction', {
            payload: { businessKey, correlationid, carrierId, policyNumber },
            url: `${baseUrl}/transactions`,
            function: 'webnonfinancial.addTransaction',
        });
        const { data } = await client.put<any, AxiosResponse>(
            `${baseUrl}/transactions`,
            body
        );
        browserLogInfo('webNonFinancial::Added a transaction', {
            payload: { businessKey, correlationid, carrierId, policyNumber },
            url: `${baseUrl}/transactions`,
            function: 'webnonfinancial.addTransaction',
        });
        return data;
    } catch (error: any) {
        browserLogError('webNonFinancial::Failed to add transaction', {
            ...parseErrorInformation(error),
            payload: { businessKey, correlationid, carrierId, policyNumber },
            url: `${baseUrl}/transactions`,
            function: 'webnonfinancial.addTransaction',
        });
        return error;
    }
};

export const addBeneChangeTransaction = async (
    body: BeneChangePayload,
    invokeNewBeneChangeApi?: boolean
): Promise<TransactionSubmitResponse> => {
    const { businessKey, correlationid, carrierId, policyNumber, planCode } =
        body || {};

    try {
        browserLogInfo('BeneChange::Adding a transaction', {
            payload: { businessKey, correlationid, carrierId, policyNumber },
            function: 'webnonfinancial.addBeneChangeTransaction',
        });

        const { data } = await client.put<unknown, AxiosResponse>(
            '/api/nonfinancial/beneChangeTransaction',
            {
                operation: 'addBeneChangeTransaction',
                useNewApi: invokeNewBeneChangeApi,
                planCode,
                policyNumber,
                body,
            }
        );

        browserLogInfo('BeneChange::Added a transaction', {
            payload: { businessKey, correlationid, carrierId, policyNumber },
            function: 'webnonfinancial.addBeneChangeTransaction',
        });
        return data;
    } catch (error: any) {
        browserLogError('BeneChange::Failed to add transaction', {
            ...parseErrorInformation(error),
            payload: { businessKey, correlationid, carrierId, policyNumber },
            function: 'webnonfinancial.addBeneChangeTransaction',
        });
        return error;
    }
};

export const validateBeneChangeTransaction = async (
    body: BeneChangePayload,
    invokeNewBeneChangeApi?: boolean
): Promise<TransactionResponse> => {
    const { businessKey, correlationid, carrierId, policyNumber, planCode } =
        body || {};

    try {
        browserLogInfo('BeneChangeValidation::Validating a transaction', {
            payload: { businessKey, correlationid, carrierId, policyNumber },
            function: 'webnonfinancial.validateTransaction',
        });

        const { data } = await client.post<unknown, AxiosResponse>(
            '/api/nonfinancial/beneChangeTransaction',
            {
                operation: 'validateBene',
                useNewApi: invokeNewBeneChangeApi,
                planCode,
                policyNumber,
                body,
            }
        );

        return data;
    } catch (error: any) {
        browserLogError(
            'BeneChangeValidation::Failed to validate transaction',
            {
                ...parseErrorInformation(error),
                payload: {
                    businessKey,
                    correlationid,
                    carrierId,
                    policyNumber,
                },
                function: 'webnonfinancial.validateTransaction',
            }
        );
        return error;
    }
};

export const validateAgentTransaction = async (body: any): Promise<any> => {
    const { businessKey, correlationid, carrierId, policyNumber, planCode } =
        body || {};

    const validateAgentUrl = `${baseAppUrl}/api/bpm/v1/policies/${planCode}/${policyNumber}/multi-agent/validation`;
    try {
        browserLogInfo('AgentChange::Validating a transaction', {
            payload: { businessKey, correlationid, carrierId, policyNumber },
            url: validateAgentUrl,
            function: 'webnonfinancial.validateAgentTransaction',
        });
        const { data } = await client.post<any, AxiosResponse>(
            validateAgentUrl,
            body
        );

        return data;
    } catch (error: any) {
        browserLogError('AgentChange::Failed to validate transaction', {
            ...parseErrorInformation(error),
            payload: { businessKey, correlationid, carrierId, policyNumber },
            url: validateAgentUrl,
            function: 'webnonfinancial.validateAgentTransaction',
        });
        return error;
    }
};

export const initialDeathClaimExists = async (
    contractNumber: string | undefined,
    clientId: string | undefined
): Promise<any> => {
    const url = `${claimUrl}/initialdeathclaim/exists?contractNumber=${contractNumber}&clientId=${clientId}`;
    try {
        browserLogInfo(
            'webNonFinancial::Checking existence of initial death claim',
            {
                params: { contractNumber, clientId },
                url: url,
                function: 'webnonfinancial.initialDeathClaimExists',
            }
        );
        const { data } = await client.get<any, AxiosResponse>(url);

        browserLogInfo(
            'webNonFinancial::Checked existence of initial death claim',
            {
                params: { contractNumber, clientId },
                url,
                data,
                function: 'webnonfinancial.initialDeathClaimExists',
            }
        );
        return data;
    } catch (error: any) {
        browserLogError(
            'webNonFinancial::Failed to check existence of initial death claim',
            {
                ...parseErrorInformation(error),
                params: { contractNumber, clientId },
                url,
                function: 'webnonfinancial.initialDeathClaimExists',
            }
        );
        return null;
    }
};

export const submitDeathClaim = async (body: any): Promise<any> => {
    const url = `${claimUrl}/initialdeathclaim`;

    try {
        browserLogInfo('webnonfinancial::Submitting claim', {
            url: url,
            policyNumber: body?.policyNumber,
            correlationid: body?.correlationid,
            function: 'webnonfinancial.submitClaim',
        });
        const { data } = await client.put<any, AxiosResponse>(url, body);
        browserLogInfo('webNonFinancial::Successfully submitted claim', {
            policyNumber: body?.policyNumber,
            correlationid: body?.correlationid,
            url: url,
            function: 'webnonfinancial.submitClaim',
            zlcaseId: data?.zlCaseId,
        });
        return data;
    } catch (error: any) {
        browserLogError('webNonFinancial::Failed to submit claim', {
            ...parseErrorInformation(error),
            correlationid: body?.correlationid,
            url: url,
            function: 'webnonfinancial.submitClaim',
        });
        return error;
    }
};

export const updateNotificationMethod = async (body: any): Promise<any> => {
    const url = `${claimUrl}/initialdeathclaim/updatenotificationmethod`;
    try {
        browserLogInfo(
            'webnonfinancial::Update notification method of beneficiaries',
            {
                url: url,
                function: 'webnonfinancial.updateNotificationMethod',
                policyNumber: body?.policyNumber,
                zlcaseId: body?.zlCaseId,
            }
        );
        const { data } = await client.put<any, AxiosResponse>(url, body);
        browserLogInfo(
            'webNonFinancial::Successfully updated notification method',
            {
                correlationid: body?.correlationid,
                url: url,
                function: 'webnonfinancial.updateNotificationMethod',
                policyNumber: body?.policyNumber,
                zlcaseId: data?.zlCaseId,
                payload: {
                    addressAction:
                        body?.beneficiaryChangeDetail?.notificationPreferences
                            ?.address?.action,
                    emailAction:
                        body?.beneficiaryChangeDetail?.notificationPreferences
                            ?.email?.action,
                    faxAction:
                        body?.beneficiaryChangeDetail?.notificationPreferences
                            ?.fax?.action,
                    notificationMethod:
                        body?.beneficiaryChangeDetail?.notificationPreferences
                            ?.notificationMethod,
                    beneficiaryRecordId: body?.beneficiaryRecordId,
                },
            }
        );
        return data;
    } catch (error) {
        browserLogError(
            'webNonFinancial::Failed to update notification method',
            {
                ...parseErrorInformation(error),
                correlationid: body?.correlationid,
                url: url,
                function: 'webnonfinancial.updateNotificationMethod',
                policyNumber: body?.policyNumber,
                zlcaseId: body?.zlCaseId,
                payload: {
                    addressAction:
                        body?.beneficiaryChangeDetail?.notificationPreferences
                            ?.address?.action,
                    emailAction:
                        body?.beneficiaryChangeDetail?.notificationPreferences
                            ?.email?.action,
                    faxAction:
                        body?.beneficiaryChangeDetail?.notificationPreferences
                            ?.fax?.action,
                    notificationMethod:
                        body?.beneficiaryChangeDetail?.notificationPreferences
                            ?.notificationMethod,
                    beneficiaryRecordId: body?.beneficiaryRecordId,
                },
            }
        );
        return error;
    }
};

export const initialDeathClaimExistsSsr = async (
    contractNumber: string | undefined,
    clientId: string | undefined,
    accessToken: string | undefined,
    loggingContext: LoggingContext
): Promise<any> => {
    const url = `${apiServerBaseUrl}/webnonfinancial/claim/v1/initialdeathclaim/exists?contractNumber=${contractNumber}&clientId=${clientId}`;
    const logContext = { ...loggingContext, url, contractNumber, clientId };
    try {
        logInfo(
            'webonofinancial::initialDeathClaimExistsSsr::Requested claim exists check',
            { ...logContext }
        );

        const { data } = await serverApi.get<null, AxiosResponse>(
            url,
            {
                authorization: `Bearer ${accessToken}`,
                headers: {
                    Accept: '*/*',
                    'Accept-Encoding': 'gzip, deflate, br',
                    Connection: 'keep-alive',
                    'Access-Control-Allow-Origin': '*',
                },
            },
            loggingContext
        );
        logInfo(
            'webonofinancial::initialDeathClaimExistsSsr::Completed claim exists check',
            { ...loggingContext, data }
        );
        return data;
    } catch (error: any) {
        logError(
            'webonofinancial::initialDeathClaimExistsSsr::Failed claim exists check',
            { ...parseErrorInformation(error), ...loggingContext }
        );
        throw error;
    }
};
