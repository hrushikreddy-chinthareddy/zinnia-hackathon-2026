import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

const usePomExperience = (): boolean => {
    const { featureFlags } = useOptimizely();
    // @TODO: SWZ-559 https://zinnia.atlassian.net/browse/SWZ-559
    // add Set up FGA permissions for POM experience
    // const permissions = usePermissionsContext();
    const shouldShowPomExperience = featureFlags?.[FEATURE_FLAGS.POM_EXPERIENCE];

    return shouldShowPomExperience;
};

export default usePomExperience;
