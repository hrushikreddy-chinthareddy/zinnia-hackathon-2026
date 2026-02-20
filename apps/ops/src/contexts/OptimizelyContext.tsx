import { useQuery } from '@tanstack/react-query';
import { ReactNode, createContext, useContext } from 'react';

import {
    getFeatureFlags,
    getFeatureFlagVariables,
} from '@deps/queries/api/optimizely';
import { FIFTEEN_MINUTES_IN_MS } from '@deps/types/constants';
import {
    FeatureFlags,
    FeatureFlagVariableType,
} from '@deps/utils/optimizely/optimizely';

export interface OptimizelyData {
    featureFlags: FeatureFlags;
    featureFlagVariables: FeatureFlagVariableType;
    areFlagsLoading: boolean;
}

interface OptimizelyProviderProps {
    children: ReactNode;
}

export enum OptimizelyVariableKey {
    Clients = 'clients',
}

const OptimizelyDataContext = createContext<OptimizelyData>({
    featureFlags: {},
    featureFlagVariables: {},
    areFlagsLoading: true,
});

export const useOptimizely = () => {
    return useContext(OptimizelyDataContext);
};

export const OptimizelyProvider = ({ children }: OptimizelyProviderProps) => {
    const { data: featureFlags, isLoading: loading } = useQuery({
        queryKey: ['featureFlags'],
        queryFn: () => getFlags(),
        staleTime: FIFTEEN_MINUTES_IN_MS,
    });

    const { data: featureFlagVariables, isLoading: loading2 } = useQuery({
        queryKey: ['featureFlagVariables'],
        queryFn: () => getFlagVariables(),
        staleTime: FIFTEEN_MINUTES_IN_MS,
    });

    const getFlags = async () => {
        const flags = await getFeatureFlags();
        return flags;
    };

    const getFlagVariables = async () => {
        const variables = await getFeatureFlagVariables();
        return variables;
    };

    return (
        <OptimizelyDataContext.Provider
            value={{
                featureFlags: featureFlags || {},
                areFlagsLoading: loading || loading2,
                featureFlagVariables: featureFlagVariables || {},
            }}
        >
            {!loading && children}
        </OptimizelyDataContext.Provider>
    );
};
