import { ReactNode, createContext, useContext } from 'react';

import { getFeatureFlags } from '@deps/queries/api/optimizely';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';
import { useQuery } from '@tanstack/react-query';
import { FIFTEEN_MINUTES_IN_MS } from '@deps/types/constants';

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
    const { data: featureFlags, isLoading: loading } = useQuery({
        queryKey: ['featureFlags'],
        queryFn: () => getFlags(),
        staleTime: FIFTEEN_MINUTES_IN_MS,
    });

    const getFlags = async () => {
        const flags = await getFeatureFlags();
        return flags;
    };

    return (
        <OptimizelyDataContext.Provider value={{ featureFlags: featureFlags || {}, areFlagsLoading: loading }}>
            {!loading && children}
        </OptimizelyDataContext.Provider>
    );
};
