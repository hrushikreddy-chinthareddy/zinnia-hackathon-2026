import { useQuery } from '@tanstack/react-query';

import { UserPermission } from '@deps/models/user-profile';
import { getCarrierList } from '@deps/queries/api/fga';

export const useCarrierListQuery = (
    partyId?: string,
    relation?: UserPermission
) => {
    return useQuery({
        queryKey: ['carrierList', partyId, relation],
        queryFn: () => getCarrierList(partyId!, relation!),
        enabled: !!partyId && !!relation,
        select: (data) => data.data,
    });
};
