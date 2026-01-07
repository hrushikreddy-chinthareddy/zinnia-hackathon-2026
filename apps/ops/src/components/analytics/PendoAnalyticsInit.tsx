import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect, useMemo } from 'react';

import { isInternalZinniaUser } from '@deps/helpers/user.helpers';
import useUserCarrier from '@deps/hooks/user-carrier-specific/useUserCarrier';
import { UserProfile as ZinniaUserProfile } from '@deps/models/user-profile';
import { browserLogError } from '@deps/utils/browser-logging';
import { getRolesFromCookie } from '@deps/utils/permissionsCookie';
import { PendoOptions } from 'globals';

// Account for additional properties on the user profile
declare module '@auth0/nextjs-auth0/client' {
    interface UserProfile extends ZinniaUserProfile {}
}

const PendoAnalyticsInit = () => {
    const { user } = useUser();
    const carrier = useUserCarrier();

    const initOptions = useMemo((): PendoOptions | undefined => {
        const userRolesMap = getRolesFromCookie();
        if (!userRolesMap) {
            return undefined;
        }

        if (user?.partyId && carrier) {
            const isInternalUser = isInternalZinniaUser(user);
            const roles = Object.keys(userRolesMap);

            // Combine and deduplicate carriers
            const carrierAccessList = Array.from(
                new Set(Object.values(userRolesMap).flat())
            );

            // Create a flat list of role:carrier
            const roleToCarrierMap = Object.entries(userRolesMap)
                .map(([role, carriers]) =>
                    carriers.map<`${string}:${string}`>(
                        (carrier) => `${role}:${carrier}`
                    )
                )
                .flat();

            return {
                visitor: {
                    id: user.partyId, // Indicates the unique visitor ID
                    email: user.email ?? undefined,
                    firstLogin: user.updated_at ?? undefined,
                    isInternalZinniaUser: String(isInternalUser ?? false),
                    roles,
                    carrierAccessList,
                    roleToCarrierMap,
                },
                account: {
                    id: carrier, // Indicates the source of traffic (Zinnia Live vs 3rt party portal)
                },
            };
        }
    }, [user, carrier]);

    useEffect(() => {
        if (initOptions) {
            if (window.pendo) {
                window.pendo.initialize(initOptions);
            } else {
                browserLogError(
                    'pendo::Pendo not loaded, skipping initialization',
                    {
                        user: initOptions.visitor.id,
                    }
                );
            }
        }
    }, [initOptions]);

    const options = useMemo(() => {
        if (!initOptions) {
            return undefined;
        }
        const updatedOptions: PendoOptions = initOptions;

        // TODO: add carriers, roles, groups, perms

        return updatedOptions;
    }, [initOptions]); // Should depend on any additional metadata

    useEffect(() => {
        if (options) {
            if (window.pendo) {
                // Update the visitor options with any additional metadata
                window.pendo.updateOptions(options);
            } else {
                browserLogError(
                    'pendo::Pendo not loaded, skipping option update',
                    {
                        user: options.visitor.id,
                    }
                );
            }
        }
    }, [options]);

    return null;
};

export default PendoAnalyticsInit;
