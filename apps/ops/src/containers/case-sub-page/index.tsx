import { BadgeVariant } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import { getStatusDetails } from '@deps/components/case-list/components/case-status-tooltip';
import CaseSubPage from '@deps/components/case-sub-page/case-sub-page';
import { TranslationFiles } from '@deps/config/translations';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { Case } from '@deps/models/case/case';
import { getCaseDetails } from '@deps/queries/api/cases';
import { baseAppUrl } from '@deps/queries/api-config';
import { CaseDetailsTabValues } from '@deps/types/constants';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import CasePageHeader from './CasePageHeader';
import CaseSideNav from './CaseSideNav';

interface CaseRedesignProps {
    caseDetails: Case;
    tab?: string; // The subpath (if any)
}

const CaseRedesign = ({ caseDetails, tab }: CaseRedesignProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const [tabVal, setTabVal] = useState(tab);
    const { featureFlags } = useOptimizely();

    const [caseDetailsModel, setCaseDetailsModel] = useState(caseDetails);

    useEffect(() => {
        let caseRefreshInterval: NodeJS.Timer | undefined;
        let caseRefreshTimeout: NodeJS.Timeout | undefined;
        const isProgressPage = tabVal === CaseDetailsTabValues.progress;
        // Only auto refresh if we are on the progress page. DEPU-2742
        if (featureFlags[FEATURE_FLAGS.AUTO_REFRESH_CASE_DETAILS] && isProgressPage) {
            caseRefreshInterval = setInterval(async () => {
                const deets = await getCaseDetails(caseDetails.id);
                deets && setCaseDetailsModel(deets);
            }, 5000);

            caseRefreshTimeout = setTimeout(() => {
                clearInterval(caseRefreshInterval);
            }, 1000 * 60 * 20);
        }

        return () => {
            clearInterval(caseRefreshInterval);
            clearTimeout(caseRefreshTimeout);
        };
    }, [caseDetails.id, featureFlags, tabVal]);

    const handleTabChange = (val: string) => {
        // We do not want to send the user to a new page, just update the URL in response to a user action
        window.history.replaceState(window.history.state, '', `${baseAppUrl}/cases/${caseDetails?.id}/${val}`);
        setTabVal(val);
    };

    const statusDetails = getStatusDetails({ singleCase: caseDetailsModel, t });

    return (
        <div className="w-full bg-gray-50">
            <CasePageHeader
                caseId={caseDetailsModel.id}
                title={caseDetailsModel.processSubType as string}
                tag={caseDetailsModel.process}
                status={statusDetails.statusText}
                statusTooltip={statusDetails.statusTooltip}
                statusVariant={statusDetails.statusVariant as BadgeVariant}
            />
            <div className="flex w-full flex-col justify-between gap-2 p-2 lg:flex-row">
                <CaseSideNav caseDetails={caseDetailsModel} />
                <CaseSubPage caseDetails={caseDetailsModel} tab={tabVal} handleTabChange={handleTabChange} />
            </div>
        </div>
    );
};

export default CaseRedesign;
