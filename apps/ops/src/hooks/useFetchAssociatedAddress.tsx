import { useState, useCallback } from 'react';

// import { mockRolesContractTable } from '@deps/containers/address-change-container/components/roles-contract/utils/roles-contract-constants';
import { getAssociatedAddresses } from '@deps/queries/api/policies';

export const useFetchAssociatedAddresses = (
    policyCode: string,
    policyNumber: string
): [boolean, (partyId: string) => void, [] | null, string | null] => {
    const [loading, setLoading] = useState(false);
    const [addressesResponse, setAddressesResponse] = useState<[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchAssociatedAddresses = useCallback(async (partyId: string) => {
        if (loading) return;

        try {
            setLoading(true);
            const { data } = await getAssociatedAddresses(policyCode, policyNumber, partyId);

            // Uncomment this to mock
            // const { data } = mockRolesContractTable;
            if (data?.policy) {
                setAddressesResponse(data.policy);
            }
            setLoading(false);
        } catch (err) {
            console.error('useFetchAssociatedAddresses::error fetching associated address', err);
            setError((err as Error).message);
            setAddressesResponse(null);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    }, []);

    return [loading, fetchAssociatedAddresses, addressesResponse, error];
};
