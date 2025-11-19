import { useUser } from '@auth0/nextjs-auth0/client';

import { isInternalZinniaUser } from '@deps/helpers/user.helpers';
import {
    UserPermission,
    UserProfile as ZinniaUserProfile,
} from '@deps/models/user-profile';

// Account for additional properties on the user profile
declare module '@auth0/nextjs-auth0/client' {
    interface UserProfile extends ZinniaUserProfile {}
}

import { useEffect, useMemo } from 'react';
import { PendoOptions } from 'globals';

import useUserCarrier from '@deps/hooks/user-carrier-specific/useUserCarrier';
import { useCarrierList } from '@deps/hooks/user/useCarrierList';
import { useRoleList } from '@deps/hooks/user/useRoleList';

const PendoAnalyticsInit = () => {
    const { user } = useUser();
    const carrier = useUserCarrier();
    const { data: authorizedCarriers } = useCarrierList(
        user?.partyId,
        UserPermission.AllowUIAccess
    );
    const { data: authorizedRoles } = useRoleList(
        user?.partyId,
        UserPermission.AllowUIAccess
    );

    const initOptions = useMemo(() => {
        if (user?.partyId && carrier) {
            const isInternalUser = isInternalZinniaUser(user);

            return {
                visitor: {
                    id: user.partyId, // Indicates the unique visitor ID
                    ...(user.email && { email: user.email }),
                    ...(user.updated_at && {
                        firstLogin: user.updated_at,
                    }),
                    ...(isInternalUser != null && {
                        isInternaZinnialUser: String(isInternalUser),
                    }),
                },
                account: {
                    id: carrier, // Indicates the source of traffic (Zinnia Live vs 3rt party portal)
                },
            };
        }
    }, [user, carrier]);

    useEffect(() => {
        if (initOptions) {
            window.pendo.initialize(initOptions);
        }
    }, [initOptions]);

    const options = useMemo(() => {
        if (!initOptions) {
            return undefined;
        }
        const updatedOptions: PendoOptions = {
            ...initOptions,
            visitor: {
                ...initOptions?.visitor,
                ...(authorizedCarriers && {
                    carrierAccessList: authorizedCarriers,
                }),
                ...(authorizedRoles && { roles: authorizedRoles }),
            },
        };

        return updatedOptions;
    }, [initOptions, authorizedCarriers, authorizedRoles]); // Should depend on any additional metadata

    useEffect(() => {
        if (options) {
            // Update the visitor options with any additional metadata
            window.pendo.updateOptions(options);
        }
    }, [options]);

    return null;
};

export default PendoAnalyticsInit;
