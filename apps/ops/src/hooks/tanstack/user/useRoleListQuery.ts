import { useQuery } from '@tanstack/react-query';

import { UserPermission } from '@deps/models/user-profile';
import { getRoleList } from '@deps/queries/api/fga';

export const useRoleListQuery = (
    partyId?: string,
    relation?: UserPermission
) => {
    return useQuery({
        queryKey: ['roleList', partyId, relation],
        queryFn: () => getRoleList(partyId!, relation!),
        enabled: !!partyId && !!relation,
        select: (data) => data.data,
    });
};
