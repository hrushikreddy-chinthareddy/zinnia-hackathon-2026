import { UserPermission } from '@deps/models/user-profile';
import {
    bulkCheckResponseClient,
    checkTuple,
    getCarrierList,
} from '@deps/queries/api/fga';
import { baseAppUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { BulkCheckTuple, FGA_Tuple } from '@deps/utils/auth';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import {
    checkPermissionsCookieForTuple,
    doesPermissionsHaveCarrierRelation,
    checkPermissionsCookieForCarrierList,
} from '@deps/utils/permissionsCookie';

/**
 * Checks a batch of tuples for permission and returns the results.
 *
 * @param {{ tuples: FGA_Tuple[] }} options An object containing an array of tuples to check.
 * @returns {Promise<BulkCheckTuple[]>} A promise that resolves to an array of tuples with permission results.
 * @throws {Error} If an error occurs while checking permission or if no tuples are found.
 */
export const bulkCheckPermissionsQuery = async ({
    tuples,
}: {
    tuples: FGA_Tuple[];
}): Promise<BulkCheckTuple[]> => {
    const checkedTuples = tuples.map((tuple) => {
        return {
            ...tuple,
            allowed: checkPermissionsCookieForTuple(
                tuple.relation,
                tuple.object
            ),
        };
    });
    const neededTuples = checkedTuples.filter(
        (tuple) => tuple.allowed === undefined
    );
    if (neededTuples.length) {
        const result = await bulkCheckResponseClient({ tuples: neededTuples });
        result?.data?.tuples?.forEach((tuple) => {
            const index = checkedTuples.findIndex(
                (t) =>
                    t.relation === tuple.relation && t.object === tuple.object
            );
            if (index !== -1) {
                checkedTuples[index].allowed = tuple.allowed;
            }
        });
    }

    //TODO: Is this correct to throw an error here?
    if (!checkedTuples.length) {
        throw 'No tuples found';
    }

    return checkedTuples.map((tuple) => ({
        ...tuple,
        allowed: !!tuple.allowed,
    }));
};

/**
 * Checks if a user has permission to access a specific resource based on the provided relation, tuple object, party ID, and carrier.
 *
 * @param {string} relation The relation to check for permission. For example: UserPermission.AllowEditPolicy
 * @param {string} tupleObject The tuple object to check for permission. For example: `policy:${policy.policyNumber}_${policy.planCode}`
 * @param {string} partyId The party ID to use for checking permission.
 * @param {string} [carrier] The carrier to check for permission at the carrier level. Optional.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the user has permission to access the resource.
 * @throws {Error} If an error occurs while checking permission.
 */
export const hasPermissionQuery = async (
    relation: string,
    tupleObject: string,
    partyId: string,
    carrier?: string
): Promise<boolean> => {
    // check if the user has the relation at the carrier level
    // if it doesn't exist OR is false at the carrier level, we need to do a tuple check before returning false
    if (!partyId || !relation) return false;
    if (carrier && doesPermissionsHaveCarrierRelation(relation, carrier)) {
        return true;
    }

    const tupleValue = checkPermissionsCookieForTuple(relation, tupleObject);

    // return the tuple check if it exists, otherwise we need to make a request
    if (tupleValue !== undefined) {
        return tupleValue;
    }

    const result = await checkTuple(partyId, relation, tupleObject);

    //TODO: Do we want to throw an error here?
    if (result.error) {
        throw result.error;
    }

    return !!result.data;
};

/**
 * Retrieves a list of carriers based on the provided relation and party ID.
 *
 * @param {string} relation The relation to use for retrieving the carrier list.
 * @param {string} partyId The party ID to use for retrieving the carrier list.
 * @returns {Promise<string[]>} A promise that resolves to an array of carrier IDs.
 * @throws {Error} If an error occurs while retrieving the carrier list.
 */
export const getCarriersListQuery = async (
    relation: string,
    partyId: string
): Promise<string[]> => {
    const cookieCarrierList = checkPermissionsCookieForCarrierList(relation);
    if (!partyId || !relation) return [];
    if (cookieCarrierList !== undefined) {
        return cookieCarrierList;
    }
    const result = await getCarrierList(partyId, relation as UserPermission);
    if (result.error) {
        throw result.error;
    }

    return result.data ?? [];
};

/**
 * Checks if a user has permission to access a specific page based on the provided permission and party ID.
 *
 * @param {UserPermission} permission The permission to check for.
 * @param {string} partyId The party ID to use for checking the permission.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the user has permission to access the page.
 */
export const doesUserHavePagePermissionQuery = async (
    permission: UserPermission,
    partyId: string
): Promise<boolean> => {
    if (!partyId || !permission) return false;

    const carriers = await getCarriersListQuery(permission, partyId);

    if (carriers.length > 0) {
        return true;
    }

    return false;
};
export interface CheckQueueAccessRequest {
    user: string;
    relation: 'read_queue' | 'write_queue';
    object: string;
}

interface CheckQueueAccessResponse {
    allowed: boolean;
}

export const checkQueueAccess = async (
    partyId: string,
    queue?: string,
    relation: 'read_queue' | 'write_queue' = 'read_queue'
): Promise<boolean> => {
    if (!queue) return false;

    try {
        const url = `${baseAppUrl}/api/fga/v1/check`;
        const requestBody: CheckQueueAccessRequest = {
            user: `party:${partyId}`,
            relation,
            object: `queue:${queue}`,
        };
        browserLogInfo('permissionsQueries::checkQueueAccess', {
            queue,
            relation,
            partyId,
        });
        const response = await client.post<
            CheckQueueAccessRequest,
            { data: CheckQueueAccessResponse }
        >(url, requestBody);
        return response?.data?.allowed;
    } catch (error: any) {
        browserLogError('Error in checkQueueAccess:', error);
        throw error;
    }
};

export const checkQueuePermissions = async (
    partyId: string,
    queue?: string
): Promise<{ canRead: boolean; canWrite: boolean }> => {
    if (!partyId || !queue) {
        return { canRead: false, canWrite: false };
    }

    const [canRead, canWrite] = await Promise.all([
        checkQueueAccess(partyId, queue, 'read_queue'),
        checkQueueAccess(partyId, queue, 'write_queue'),
    ]);

    return { canRead, canWrite };
};
