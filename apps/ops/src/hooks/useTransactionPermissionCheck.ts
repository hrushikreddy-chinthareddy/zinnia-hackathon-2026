import { useQuery } from '@tanstack/react-query';
import { TransactionPermission } from '@xd/utils/src/auth/auth';

import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { checkTransactionPermissionQuery } from '@deps/queries/api/fga';
import { FIVE_MINUTES_IN_MS } from '@deps/types/constants';

export const useTransactionPermissionCheck = (
    relation: TransactionPermission,
    policyNumber?: string,
    planCode?: string
) => {
    const { partyId } = usePermissionsContext();

    const { data, isLoading } = useQuery({
        queryKey: [
            'checkWritePolicyPermission',
            relation,
            partyId,
            policyNumber,
            planCode,
        ],
        queryFn: async () =>
            checkTransactionPermissionQuery(
                partyId,
                policyNumber,
                planCode,
                relation
            ),
        enabled: !!partyId && !!policyNumber,
        staleTime: FIVE_MINUTES_IN_MS, // //TODO: Do we want to cache this? For how long?
    });

    return {
        isPermissioned: data?.data ?? false,
        isLoading,
    };
};
