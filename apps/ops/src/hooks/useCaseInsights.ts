import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

const useCaseInsightsPermission = () => {
    const { featureFlags } = useOptimizely();
    const permissions = usePermissionsContext();
    const shouldShowCaseInsightsFlag = featureFlags?.[FEATURE_FLAGS.CASE_INSIGHTS];

    return shouldShowCaseInsightsFlag && permissions.hasCaseInsightPermission;
};

export default useCaseInsightsPermission;
