import {
    BulkCheckTuple,
    checkIfUserIsSuperAdmin,
    createBulkCheckBodyRequest,
} from './auth';

export async function checkIsSuperAdminSsr({
    partyId,
    accessToken,
}: {
    partyId?: string;
    accessToken?: string;
}) {
    try {
        if (!partyId || !accessToken) {
            return false;
        }

        const bulkCheckResponse = await fetch(
            `${process.env.API_BASE_URL}/fga/v1/bulk-check`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(createBulkCheckBodyRequest(partyId)),
            }
        );

        const data = (await bulkCheckResponse.json()) as {
            tuples: BulkCheckTuple[];
        };
        const result = checkIfUserIsSuperAdmin(data.tuples);

        return result;
    } catch (error) {
        console.error('checkIsSuperAdmin action', error);
        return false;
    }
}
