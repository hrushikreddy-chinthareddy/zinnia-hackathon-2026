import { useQuery } from '@tanstack/react-query';

import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { checkWritePolicyPermissionQuery } from '@deps/queries/api/fga';
import { FIVE_MINUTES_IN_MS } from '@deps/types/constants';

export const useWritePolicyPermissionCheck = (
    policyNumber?: string,
    planCode?: string
) => {
    const { partyId } = usePermissionsContext();

    const { data, isLoading } = useQuery({
        queryKey: [
            'checkWritePolicyPermission',
            partyId,
            policyNumber,
            planCode,
        ],
        queryFn: async () =>
            checkWritePolicyPermissionQuery(partyId, policyNumber, planCode),
        enabled: !!partyId && !!policyNumber,
        staleTime: FIVE_MINUTES_IN_MS, // //TODO: Do we want to cache this? For how long?
    });

    return {
        isPermissioned: data?.data ?? false,
        isLoading,
    };
};
