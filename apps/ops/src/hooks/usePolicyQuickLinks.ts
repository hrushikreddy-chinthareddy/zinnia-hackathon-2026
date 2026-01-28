import { useQuery } from '@tanstack/react-query';
import { TFunction } from 'i18next';

import { getPolicyQuickLinks } from '@deps/containers/quick-links/quick-links.helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';

export const usePolicyQuickLinks = (
    t: TFunction,
    policy: PolicyDetails,
    hasCallLogsAccess?: boolean,
    hasDocumentAccess?: boolean
) => {
    return useQuery({
        queryKey: [
            'quickLinks',
            policy,
            t,
            hasCallLogsAccess,
            hasDocumentAccess,
        ],
        queryFn: () =>
            getPolicyQuickLinks(
                t,
                policy,
                hasCallLogsAccess,
                hasDocumentAccess
            ),
    });
};
