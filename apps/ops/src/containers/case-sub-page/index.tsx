import { useQuery } from '@tanstack/react-query';
import { BadgeVariant } from '@zinnia/bloom/components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import { getStatusDetails } from '@deps/components/case-list/components/case-status-tooltip';
import CaseSubPage from '@deps/components/case-sub-page/case-sub-page';
import { TranslationFiles } from '@deps/config/translations';
import { useCaseActivityContext } from '@deps/contexts/CaseActivityContext';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { Case } from '@deps/models/case/case';
import { baseAppUrl } from '@deps/queries/api-config';
import { getCaseDetailsQuery } from '@deps/queries/tanstack/caseQueries/caseQueries';
import { CaseDetailsTabValues } from '@deps/types/constants';
import { browserLogInfo } from '@deps/utils/browser-logging';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import CasePageHeader from './CasePageHeader';
import CaseSideNav from './CaseSideNav';
import styles from './styles.module.css';

interface CaseOverviewProps {
    caseDetails: Case;
    tab?: string; // The subpath (if any)
}

const CaseOverview = ({ caseDetails, tab }: CaseOverviewProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const [tabVal, setTabVal] = useState(tab);
    const { featureFlags } = useOptimizely();
    const { policy } = useCaseActivityContext();
    const { hasCallLogsAccess, hasNotesAccess } = usePermissionsContext();
    const router = useRouter();
    const { query } = router;

    const { data: caseDetailsModel } = useQuery({
        queryKey: ['caseDetails', caseDetails?.id],
        queryFn: () => getCaseDetailsQuery(caseDetails?.id, featureFlags),
        initialData: caseDetails,
        refetchInterval:
            tabVal === CaseDetailsTabValues.progress &&
            featureFlags[FEATURE_FLAGS.AUTO_REFRESH_CASE_DETAILS]
                ? 5000
                : false,
    });

    const handleTabChange = (val: string) => {
        // We do not want to send the user to a new page, just update the URL in response to a user action
        window.history.replaceState(
            window.history.state,
            '',
            `${baseAppUrl}/cases/${caseDetails?.id}/${val}`
        );
        setTabVal(val);
    };

    useEffect(() => {
        browserLogInfo('CaseOverview_Permission_Check', {
            pathname: router.pathname,
            hasCallLogsAccess,
            hasNotesAccess,
            caseId: caseDetails?.id,
            policyNumber: policy?.policyNumber,
        });
        const isNotesTab = query?.tab === CaseDetailsTabValues['notes'];
        const isCallLogsTab = query?.tab === CaseDetailsTabValues['call-logs'];
        if (
            (isNotesTab && !hasNotesAccess) ||
            (isCallLogsTab && !hasCallLogsAccess)
        ) {
            router.push(`${baseAppUrl}/cases/${caseDetails?.id}/progress`);
        }
        setTabVal(CaseDetailsTabValues.progress);
    }, [hasCallLogsAccess, hasNotesAccess, router]);

    const statusDetails = getStatusDetails({
        singleCase: caseDetailsModel,
        t,
        issueDate: policy?.issueDate,
    });

    return (
        <div className={styles.container}>
            <CasePageHeader
                caseId={caseDetailsModel.id}
                title={caseDetailsModel.processSubType as string}
                tag={caseDetailsModel.process}
                status={statusDetails.statusText}
                statusTooltip={statusDetails.statusTooltip}
                statusVariant={statusDetails.statusVariant as BadgeVariant}
            />
            <div className="flex w-full flex-col justify-between gap-2 pt-2 lg:flex-row">
                <CaseSideNav caseDetails={caseDetailsModel} />
                <CaseSubPage
                    caseDetails={caseDetailsModel}
                    tab={tabVal}
                    handleTabChange={handleTabChange}
                />
            </div>
        </div>
    );
};

export default CaseOverview;
