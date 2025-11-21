import { AxiosResponse } from 'axios';

import { UserPermission } from '@deps/models/user-profile';
import { ApiResponse } from '@deps/types/api-response';
import {
    CheckTupleResponse,
    Tuple,
    GetCarrierListQuery,
    TupleRequest,
    TupleResponse,
    GetRoleListQuery,
} from '@deps/types/fga';
import { TransactionPermission } from '@deps/utils/auth';
import { browserLogError, browserLogWarn } from '@deps/utils/browser-logging';
import { pullFromCache, writeToCache } from '@deps/utils/cache';

import { baseAppUrl } from '../api-config';
import { client } from '../api-utils/client';

const baseUrl = baseAppUrl + '/api/fga/v1';
const bulkCheckUrl = baseUrl + '/bulk-check';

export const bulkCheckResponseClient = async (
    body?: TupleRequest
): Promise<ApiResponse<TupleResponse>> => {
    try {
        const bulkCheckRequest = await client.post<
            TupleRequest,
            AxiosResponse<TupleResponse>
        >(bulkCheckUrl, body);
        const response: ApiResponse<TupleResponse> = {
            data: bulkCheckRequest.data,
            error: null,
        };
        if (bulkCheckRequest.status !== 200) {
            response.error = {
                status: bulkCheckRequest.status,
                message: bulkCheckRequest.statusText,
                name: 'Error checking tuples',
            };
        }
        return response;
    } catch (e) {
        browserLogError(
            'bulkCheckResponse::An error occurred while calling bulk check endpoint',
            {
                file: 'queries/api/fga',
                function: 'bulkCheckResponse',
                url: bulkCheckUrl,
            }
        );
        return {
            data: null,
            error: {
                status: 500,
                message: (e as Error)?.message,
                name: 'Error checking tuples',
            },
        };
    }
};

export const checkTuple = async (
    partyId: string,
    relation: string,
    tupleObject: string
): Promise<ApiResponse<boolean>> => {
    const tuple = {
        user: `party:${partyId}`,
        relation,
        object: tupleObject,
    };
    const cachedResult = pullFromCache('checkTuple', tuple);

    if (cachedResult) return cachedResult;

    const fgaCheck = await client.post<
        Tuple,
        AxiosResponse<CheckTupleResponse>
    >(`${baseUrl}/check`, tuple);
    const allowed = fgaCheck?.data?.allowed;

    const response: ApiResponse<boolean> = {
        data: !!allowed,
        error: null,
    };

    if (fgaCheck.status === 200) {
        writeToCache('checkTuple', tuple, response);
    } else {
        response.error = {
            status: fgaCheck.status,
            message: fgaCheck.statusText,
            name: 'Error checking tuple',
        };
    }

    return response;
};

export const getCarrierList = async (
    partyId: string,
    relation: UserPermission,
    planCode?: string | string[] | undefined,
    policyNumber?: string | undefined
): Promise<ApiResponse<string[]>> => {
    const url = `${baseUrl}/list-carriers`;

    try {
        const query: GetCarrierListQuery = {
            user: `party:${partyId}`,
            relation,
        };
        if (planCode) {
            query.planCode = planCode;
        }
        if (policyNumber) {
            query.policyNumber = policyNumber;
        }

        const cachedResult = pullFromCache('getCarrierList', query);
        if (cachedResult) return cachedResult;

        const carrierListCheck = await client.post<
            GetCarrierListQuery,
            AxiosResponse
        >(url, query);
        const response: ApiResponse<string[]> = {
            data: carrierListCheck?.data?.carriers || [],
            error: null,
        };

        if (carrierListCheck.status === 200) {
            writeToCache('getCarrierList', query, response, 10);
        } else {
            browserLogWarn(
                'getCarrierList::An error occurred while getting the carrier list',
                {
                    file: 'queries/api/fga',
                    function: 'getCarrierList',
                    url,
                }
            );
            response.error = {
                status: carrierListCheck.status,
                message: carrierListCheck.statusText,
                name: 'Error getting carrier list',
            };
        }

        return response;
    } catch (error: any) {
        browserLogWarn(
            'getCarrierList::An error occurred while getting the carrier list',
            {
                file: 'queries/api/fga',
                function: 'getCarrierList',
                url,
            }
        );
        return {
            data: [],
            error: {
                status: 500,
                message: error.message,
                name: 'Error getting carrier list',
            },
        };
    }
};

export const getRoleList = async (
    partyId: string,
    relation: UserPermission
): Promise<ApiResponse<string[]>> => {
    const url = `${baseUrl}/list`;

    try {
        const query: GetRoleListQuery = {
            user: `party:${partyId}`,
            relation,
            type: 'role',
        };

        const cachedResult = pullFromCache('getRoleList', query);
        if (cachedResult) return cachedResult;

        const roleListCheck = await client.post<
            GetRoleListQuery,
            AxiosResponse
        >(url, query);

        const response: ApiResponse<string[]> = {
            data: roleListCheck?.data?.objects || [],
            error: null,
        };

        if (roleListCheck.status === 200) {
            writeToCache('getRoleList', query, response, 10);
        } else {
            browserLogWarn(
                'getRoleList::An error occurred while getting the role list',
                {
                    file: 'queries/api/fga',
                    function: 'getRoleList',
                    url,
                }
            );
            response.error = {
                status: roleListCheck.status,
                message: roleListCheck.statusText,
                name: 'Error getting role list',
            };
        }

        return response;
    } catch (error: any) {
        browserLogWarn(
            'getRoleList::An error occurred while getting the role list',
            {
                file: 'queries/api/fga',
                function: 'getRoleList',
                url,
            }
        );
        return {
            data: [],
            error: {
                status: 500,
                message: error.message,
                name: 'Error getting role list',
            },
        };
    }
};

export const checkTransactionPermissionQuery = async (
    partyId: string,
    policyNumber: string | undefined,
    planCode: string | undefined,
    relation: TransactionPermission
): Promise<ApiResponse<boolean>> => {
    const url = `${baseUrl}/check-policy`;

    const body = {
        user: `party:${partyId}`,
        relation,
        policyNumber,
        planCode,
    };

    try {
        const fgaCheck = await client.post<
            typeof body,
            AxiosResponse<CheckTupleResponse>
        >(url, body);

        const allowed = fgaCheck?.data?.allowed;

        const response: ApiResponse<boolean> = {
            data: !!allowed, // Ensure we return a boolean
            error: null,
        };

        if (fgaCheck.status !== 200) {
            response.error = {
                status: fgaCheck.status,
                message: fgaCheck.statusText,
                name: 'Error checking write_all_transactions permission',
            };
        }

        return response;
    } catch (e: any) {
        browserLogError(
            'checkWritePolicyPermissionQuery::An error occurred while checking write_all_transactions permission',
            {
                file: 'queries/api/fga.ts',
                function: 'checkWritePolicyPermissionQuery',
                url,
                extra: {
                    partyId,
                    policyNumber,
                    planCode,
                    errorMessage: e.message,
                },
            }
        );

        return {
            data: false,
            error: {
                status: 500,
                message: e.message,
                name: 'Exception during write_all_transactions check',
            },
        };
    }
};
