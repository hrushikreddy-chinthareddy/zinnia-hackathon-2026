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

import { PendoOptions } from 'globals';
import { useEffect, useMemo } from 'react';

import { useCarrierListQuery } from '@deps/hooks/tanstack/user/useCarrierListQuery';
import { useRoleListQuery } from '@deps/hooks/tanstack/user/useRoleListQuery';
import useUserCarrier from '@deps/hooks/user-carrier-specific/useUserCarrier';

const PendoAnalyticsInit = () => {
    const { user } = useUser();
    const carrier = useUserCarrier();
    const { data: authorizedCarriers } = useCarrierListQuery(
        user?.partyId,
        UserPermission.AllowUIAccess
    );
    const { data: authorizedRoles } = useRoleListQuery(
        user?.partyId,
        UserPermission.AllowUIAccess
    );

    const initOptions = useMemo((): PendoOptions | undefined => {
        if (user?.partyId && carrier) {
            const isInternalUser = isInternalZinniaUser(user);

            return {
                visitor: {
                    id: user.partyId, // Indicates the unique visitor ID
                    email: user.email ?? undefined,
                    firstLogin: user.updated_at ?? undefined,
                    isInternalZinniaUser: String(isInternalUser ?? false),
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
        let updatedOptions: PendoOptions = initOptions;

        if (authorizedCarriers) {
            updatedOptions = {
                ...updatedOptions,
                visitor: {
                    ...updatedOptions?.visitor,
                    carrierAccessList: authorizedCarriers,
                },
            };
        }

        if (authorizedRoles) {
            updatedOptions = {
                ...updatedOptions,
                visitor: {
                    ...updatedOptions?.visitor,
                    roles: authorizedRoles,
                },
            };
        }
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
