import { useQuery } from '@tanstack/react-query';

import { FindKeyValuesSidesheet } from '@deps/components/find-key-values-sidesheet/find-key-values-sidesheet';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { CardColumnsTest } from '@deps/jest/constants/test-id-constants';
import { getCasesQuery } from '@deps/queries/tanstack/caseQueries/caseQueries';
import {
    CaseSearchErrorResponse,
    CaseSearchResponse,
} from '@deps/types/search';

import {
    StatusBanner,
    OwnerInformation,
    QuickViewModule,
} from './policy-summary-card';
import { default as styles } from './policy-summary-card.module.css';
import {
    ButtonSkeleton,
    OwnerInfoSkeleton,
    QuickViewSkeleton,
} from './skeletons';

export const PolicyDetailsCard = ({
    isLoading,
    policyDetails,
    caseData,
}: {
    policyDetails: PolicyDetails;
    isLoading: boolean;
    caseData?: CaseSearchResponse | CaseSearchErrorResponse | undefined;
}) => {
    const { featureFlags } = useOptimizely();
    const { data: caseInfo } = useQuery({
        queryKey: ['caseData', policyDetails.policyNumber, featureFlags],
        queryFn: () => getCasesQuery(policyDetails.policyNumber, featureFlags),
        placeholderData: (previousData) => previousData,
        initialData: caseData,
    });
    return (
        <div>
            {!isLoading && (
                <StatusBanner
                    policy={policyDetails}
                    casesTotal={
                        caseInfo && 'total' in caseInfo ? caseInfo.total : 0
                    }
                />
            )}
            <div
                data-testid={CardColumnsTest.COLUMNS}
                className={styles.policyQuickColumns}
            >
                {isLoading ? (
                    <OwnerInfoSkeleton />
                ) : (
                    <OwnerInformation policy={policyDetails} />
                )}
                {isLoading ? (
                    <QuickViewSkeleton />
                ) : (
                    <QuickViewModule policy={policyDetails} />
                )}
            </div>
            <div>
                {isLoading ? (
                    <div className="flex justify-start">
                        <ButtonSkeleton />
                    </div>
                ) : (
                    <FindKeyValuesSidesheet
                        policyNumber={policyDetails?.policyNumber}
                        planCode={policyDetails?.planCode}
                    />
                )}
            </div>
        </div>
    );
};
