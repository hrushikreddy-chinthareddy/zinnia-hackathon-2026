import { AxiosResponse } from 'axios';

import { HttpMethod, PolicyRole } from '@deps/constants/policy';
import { baseAppUrl } from '@deps/queries/api-config';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

import { deleteRoleBodyProps, TransactionResponse } from './bpm';
import { client } from '../api-utils/client';

const baseUrl = `${baseAppUrl}/api/bpm/v1`;

export interface RoleChangeRequest {
    party: {
        partyId?: string;
        partyRole?: string;
    };
}

export const validateRoleChange = async (
    planCode: string | undefined,
    policyNumber: string | undefined,
    partyId: string | null | undefined = '',
    role: PolicyRole,
    query: any
): Promise<TransactionResponse> => {
    const url = `${baseUrl}/policies/${planCode}/${policyNumber}/parties${
        partyId ? `/${partyId}` : ''
    }/${role}/validation`;

    browserLogInfo(`validateRoleChange::Starting validation for ${role}`, {
        url,
        planCode,
        policyNumber,
        partyId,
        role,
        payload: JSON.stringify(query),
    });

    try {
        const { data } = await client.post<TransactionResponse, AxiosResponse>(
            url,
            query
        );

        return data;
    } catch (error: any) {
        browserLogError(
            `validate${role}Change::an error occurred during validation check`,
            {
                ...parseErrorInformation(error),
                planCode,
                policyNumber,
                partyId,
                role,
                payload: JSON.stringify(query),
            }
        );
        return error?.data;
    }
};

export const submitRoleChange = async (
    planCode: string | undefined,
    policyNumber: string | undefined,
    role: PolicyRole,
    partyId: string | undefined = '',
    query: any
): Promise<TransactionResponse> => {
    const method = partyId ? HttpMethod.PUT : HttpMethod.POST;
    const url = `${baseUrl}/policies/${planCode}/${policyNumber}/parties${
        partyId ? `/${partyId}` : ''
    }/${role}`;

    browserLogInfo(`submitRoleChange::Starting submission for ${role}`, {
        method,
        url,
        planCode,
        policyNumber,
        partyId,
        role,
        payload: JSON.stringify(query),
        timestamp: new Date().toISOString(),
    });

    try {
        const response = await client[method]<
            TransactionResponse,
            AxiosResponse
        >(url, query);

        return { status: response.status, data: response.data };
    } catch (error: any) {
        browserLogError(
            'submitRoleChange::an error occurred during submission',
            {
                ...parseErrorInformation(error),
                method,
                planCode,
                policyNumber,
                partyId,
                role,
            }
        );
        return error?.data;
    }
};

export const deleteAssignee = async (
    planCode: string | undefined,
    policyNumber: string | undefined,
    partyId: string | undefined = '',
    query: any
): Promise<TransactionResponse> => {
    const method = HttpMethod.DELETE;
    const url = `${baseAppUrl}/api/policies/${planCode}/${policyNumber}/parties/${partyId}/Assignee`;

    browserLogInfo(`deleteAssignee::Starting deletion for Assignee`, {
        method,
        url,
        planCode,
        policyNumber,
        partyId,
        role: PolicyRole.ASSIGNEE,
        payload: JSON.stringify(query),
        timestamp: new Date().toISOString(),
    });

    try {
        const response = await client.delete<
            TransactionResponse,
            AxiosResponse
        >(url, { data: query });

        return { status: response.status, data: response.data };
    } catch (error: any) {
        browserLogError('deleteRole::an error occurred during deletion', {
            ...parseErrorInformation(error),
            method,
            planCode,
            policyNumber,
            partyId,
            role: PolicyRole.ASSIGNEE,
        });
        return error?.data;
    }
};

export const deleteTPDRole = async (
    planCode: string | undefined,
    id: string | undefined,
    role: PolicyRole,
    partyId: string,
    query: deleteRoleBodyProps
): Promise<TransactionResponse> => {
    const method = HttpMethod.DELETE;
    const url = `${baseAppUrl}/api/policies/${planCode}/${id}/parties/${partyId}/${role}`;

    browserLogInfo(`deleteRole::Starting deletion for ${role}`, {
        method,
        url,
        planCode,
        id,
        partyId,
        role,
        payload: JSON.stringify(query),
        timestamp: new Date().toISOString(),
    });

    try {
        const response = await client.delete<any>(url, { data: query });

        return { status: response.status, data: response.data };
    } catch (error: any) {
        browserLogError('deleteRole::an error occurred during deletion', {
            ...parseErrorInformation(error),
            method,
            planCode,
            id,
            partyId,
            role,
        });
        return error?.data;
    }
};
