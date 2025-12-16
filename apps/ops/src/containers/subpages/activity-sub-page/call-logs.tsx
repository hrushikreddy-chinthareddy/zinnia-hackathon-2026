import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import CallLogsTab from '@deps/components/case-sub-page/case-tabs/call-logs-tab';
import PageHeader from '@deps/components/page-header/page-header';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { baseAppUrl } from '@deps/queries/api-config';
import { browserLogInfo } from '@deps/utils/browser-logging';

export default function CallLogs() {
    const { policy } = useContext(PolicyData);
    const { t } = useTranslation();
    const { hasCallLogsAccess } = usePermissionsContext();
    const router = useRouter();
    const { query } = router;
    const { slug } = query;

    useEffect(() => {
        browserLogInfo('CaseOverview_Permission_Check', {
            pathname: router.pathname,
            hasCallLogsAccess,
            policyNumber: policy?.policyNumber,
        });
        const isCallLogsPage =
            Array.isArray(slug) && slug.includes('call-logs');
        if (isCallLogsPage && !hasCallLogsAccess) {
            router.push(
                `${baseAppUrl}/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/policy-details`
            );
        }
    }, [hasCallLogsAccess, policy, router, slug]);

    return (
        <div className="flex flex-col rounded bg-white">
            <PageHeader headerText={t('caseOverview.tabs.call-logs') || ''} />
            {hasCallLogsAccess && (
                <CallLogsTab
                    policyNumber={policy.policyNumber}
                    carrier={policy.carrierId}
                    queryLimit={10}
                />
            )}
        </div>
    );
}
