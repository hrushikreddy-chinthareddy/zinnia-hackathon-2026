import { client } from '@deps/queries/api-utils/client';

import { baseAppUrl } from '../api-config';

export const getFeatureFlags = async () => {
    try {
        const { data } = await client.get(`${baseAppUrl}/api/optimizely/feature-flags`);
        return data;
    } catch (e) {
        console.error('getFeatureFlags::error', e);
        return {};
    }
};

export const getFeatureFlagVariables = async () => {
    try {
        const { data } = await client.get(`${baseAppUrl}/api/optimizely/feature-variables`);
        return data;
    } catch (e) {
        console.error('getFeatureFlagVariables::error', e);
        return {};
    }
};
