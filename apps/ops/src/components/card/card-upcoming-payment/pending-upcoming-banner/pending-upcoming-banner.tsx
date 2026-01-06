import { BannerAlert, BannerVariant } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import useNavLink from '@deps/hooks/useNavLink';
import { Processes, Statuses } from '@deps/models/case/case';
import { getCases } from '@deps/queries/api/cases';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

type PendingUpcomingBannerProps = {
    policyNumber?: string;
    requestSubTypes?: string[];
};

const PendingUpcomingBanner = ({
    policyNumber,
    requestSubTypes,
}: PendingUpcomingBannerProps) => {
    const { t } = useTranslation();

    const bannerContainerRef = useRef<HTMLDivElement | null>(null);

    const { setAriaLabelToChildLinks } = useNavLink();

    const { featureFlags } = useOptimizely();

    const systematicProgramTablesEnabled =
        featureFlags[FEATURE_FLAGS.SYSTEMATIC_PROGRAMS_TABLE];

    const [caseIds, setCaseIds] = useState<string[]>([]);

    const fetchCases = useCallback(async () => {
        try {
            const response = await getCases(
                {
                    limit: 5,
                    caseStatus: [Statuses.InProgress],
                    policyNumber,
                    process: [Processes.SSW],
                    requestSubType: requestSubTypes,
                },
                featureFlags
            );

            if (!response) {
                console.log('Error fetching cases: No data in response');
            }

            if ('total' in response) {
                setCaseIds(response.data.map((caseItem: any) => caseItem.id));
            } else {
                console.log('Error fetching cases: No data in response');
            }
        } catch (error) {
            console.error(
                `Error fetching cases: No data in response: ${error}`
            );
        }
    }, [policyNumber]);

    useEffect(() => {
        fetchCases();
    }, [fetchCases]);

    useEffect(() => {
        if (caseIds.length > 0 && bannerContainerRef.current) {
            setAriaLabelToChildLinks(bannerContainerRef, t('caseLinkText'));
        }
    }, [caseIds, setAriaLabelToChildLinks, t]);

    if (caseIds.length === 0) {
        return null;
    }

    return (
        <div
            ref={bannerContainerRef}
            className="flex flex-col gap-4 bg-white md:p-6 lg:p-8 !pb-0"
        >
            {caseIds.map((caseId) => (
                <BannerAlert
                    key={caseId}
                    variant={BannerVariant.Information}
                    bodyText={
                        systematicProgramTablesEnabled
                            ? t('allFields.systematicProgramPendingBannerText')
                            : t('autopay.pendingBanner.text')
                    }
                    cta={{
                        href: `/cases/${caseId}`,
                        text: t('autopay.pendingBanner.caseLinkText'),
                        target: '_blank',
                    }}
                />
            ))}
        </div>
    );
};

export default PendingUpcomingBanner;
