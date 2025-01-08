import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

import { getFeatureFlags } from '@deps/queries/api/optimizely';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';

interface OptimizelyData {
    featureFlags: FeatureFlags;
    areFlagsLoading: boolean;
}

interface OptimizelyProviderProps {
    children: ReactNode;
}

const OptimizelyDataContext = createContext<OptimizelyData>({ featureFlags: {}, areFlagsLoading: true });

export const useOptimizely = () => {
    return useContext(OptimizelyDataContext);
};

export const OptimizelyProvider = ({ children }: OptimizelyProviderProps) => {
    const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({});
    // Suppressing the rendering of the children to prevent a flicker for any features.
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const getFlags = async () => {
            // If optimizely takes longer than 500ms, force loading state to false, and we'll deal with the flags coming in later
            setTimeout(() => {
                setLoading(false);
            }, 500);
            const flags = await getFeatureFlags();
            setFeatureFlags({ ...flags, [FEATURE_FLAGS.DOCUMENTS_V3]: true }); // BPB - REMOVE ME!!!!!!
            setLoading(false);
        };

        getFlags();
    }, []);

    return (
        <OptimizelyDataContext.Provider value={{ featureFlags, areFlagsLoading: loading }}>
            {!loading && children}
        </OptimizelyDataContext.Provider>
    );
};
