import { BadgeVariant } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import CaseSubPage from '@deps/components/case-sub-page/case-sub-page';
import { TranslationFiles } from '@deps/config/translations';
import { calculateDaysAgo } from '@deps/helpers/case-management';
import { Case, Statuses } from '@deps/models/case/case';
import { getCaseDetails } from '@deps/queries/api/cases';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';

import CasePageHeader from './CasePageHeader';
import CaseSideNav from './CaseSideNav';

interface CaseRedesignProps {
    caseDetails: Case;
    featureFlags: FeatureFlags;
    tab?: string; // The subpath (if any)
}

const CaseRedesign = ({ caseDetails, tab, featureFlags }: CaseRedesignProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);

    const [caseDetailsModel, setCaseDetailsModel] = useState(caseDetails);

    useEffect(() => {
        let caseRefreshInterval: NodeJS.Timer | undefined;
        let caseRefreshTimeout: NodeJS.Timeout | undefined;
        if (featureFlags[FEATURE_FLAGS.AUTO_REFRESH_CASE_DETAILS]) {
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
    }, [caseDetails.id, featureFlags]);

    const daysAgo = calculateDaysAgo(new Date(caseDetailsModel.createdAt));
    const processSubType = caseDetailsModel.processSubType?.toLowerCase();
    const process = caseDetailsModel?.process;

    let exceptionBadgeTooltip: string;

    if (caseDetailsModel.exceptions.length !== 0) {
        exceptionBadgeTooltip = `${t('caseOverview.caseStatus.exception.tooltip', {
            processSubType: processSubType ? processSubType : process,
        })}${t('caseOverview.caseStatus.exception.tooltip2', { exceptions: caseDetailsModel.exceptions.length })}`;
    } else {
        exceptionBadgeTooltip = t('caseOverview.caseStatus.zeroException.tooltip', {
            requestSubType: processSubType ? processSubType : process,
        });
    }

    function getStatusDetails() {
        let statusTooltip = '';
        let statusVariant = '';
        let statusText = '';

        switch (caseDetailsModel.caseStatus) {
            case Statuses.InProgress:
                statusVariant = BadgeVariant.INFO;
                statusTooltip = `${t('caseOverview.caseStatus.inProgress.tooltip', {
                    processSubType: processSubType ? processSubType : process,
                })}${dayjs(caseDetailsModel.createdAt).format('MM/DD/YYYY')}${t('caseOverview.caseStatus.inProgress.tooltip2', {
                    daysAgo: daysAgo,
                })}`;
                statusText = t('caseOverview.caseStatus.inProgress.badgeText');
                break;

            case Statuses.Exception:
                statusVariant = BadgeVariant.ERROR;
                statusTooltip = exceptionBadgeTooltip;
                statusText = t('caseOverview.caseStatus.exception.badgeText');
                break;

            case Statuses.Canceled:
                statusVariant = BadgeVariant.INACTIVE;
                statusTooltip = `${t('caseOverview.caseStatus.canceled.tooltip')}${dayjs(caseDetails.updatedAt).format('MM/DD/YYYY')}.`;
                statusText = t('caseOverview.caseStatus.canceled.badgeText');
                break;

            case Statuses.Completed:
                statusVariant = BadgeVariant.SUCCESS;
                statusTooltip = `${t('caseOverview.caseStatus.completed.tooltip', {
                    processSubType: processSubType ? processSubType : process,
                })}${dayjs(caseDetailsModel.updatedAt).format('MM/DD/YYYY')}.`;
                statusText = t('caseOverview.caseStatus.completed.badgeText');
                break;

            default:
                statusVariant = BadgeVariant.DEFAULT;
                statusTooltip = t('caseOverview.caseStatus.unknown.tooltip');
                statusText = t('caseOverview.caseStatus.unknown.badgeText');
                break;
        }

        return { statusTooltip, statusVariant, statusText };
    }

    const statusDetails = getStatusDetails();

    return (
        <div className="w-full bg-gray-50">
            <CasePageHeader
                title={caseDetailsModel.processSubType as string}
                tag={caseDetailsModel.process}
                status={statusDetails.statusText}
                statusTooltip={statusDetails.statusTooltip}
                statusVariant={statusDetails.statusVariant as BadgeVariant}
            />
            <div className="flex w-full flex-col justify-between gap-2 p-2 lg:flex-row">
                <CaseSideNav caseDetails={caseDetailsModel} />
                <CaseSubPage caseDetails={caseDetailsModel} tab={tab} />
            </div>
        </div>
    );
};

export default CaseRedesign;
