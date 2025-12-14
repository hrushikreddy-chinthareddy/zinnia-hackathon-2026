import { BannerAlert, BannerVariant } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import useNavLink from '@deps/hooks/useNavLink';
import { Processes, Statuses } from '@deps/models/case/case';
import { getCases } from '@deps/queries/api/cases';

type PendingUpcomingBannerProps = {
    policyNumber?: string;
    requestSubTypes?: string[];
};

const PendingUpcomingBanner = ({
    policyNumber,
    requestSubTypes,
}: PendingUpcomingBannerProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'autopay.pendingBanner',
    });

    const bannerContainerRef = useRef<HTMLDivElement | null>(null);

    const { setAriaLabelToChildLinks } = useNavLink();

    const { featureFlags } = useOptimizely();

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
                    bodyText={t('text')}
                    cta={{
                        href: `/cases/${caseId}`,
                        text: t('caseLinkText'),
                        target: '_blank',
                    }}
                />
            ))}
        </div>
    );
};

export default PendingUpcomingBanner;
