import { useUser } from '@auth0/nextjs-auth0/client';

import useUserCarrier from '@deps/hooks/user-carrier-specific/useUserCarrier';

const PendoAnalyticsInit = () => {
    const { user } = useUser();
    const carrier = useUserCarrier();

    // If user email or carrier not available, do not track
    if (!user?.email || !carrier) {
        return null;
    }

    window.pendo.initialize({
        visitor: {
            id: user.email, // Indicates the unique visitor ID
        },
        account: {
            id: carrier, // Indicates the source of traffic (Zinnia Live vs 3rt party portal)
        },
    });
};

export default PendoAnalyticsInit;
