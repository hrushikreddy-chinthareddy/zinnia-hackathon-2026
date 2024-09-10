import { AxiosResponse } from 'axios';

import { client } from '@deps/queries/api-utils/client';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';

import { baseAppUrl } from '../api-config';

export const getFeatureFlags = async () => {
    try {
        const { data } = await client.get<FeatureFlags, AxiosResponse<FeatureFlags>>(`${baseAppUrl}/api/optimizely/feature-flags`);
        return data;
    } catch (e) {
        console.error('getFeatureFlags::error', e);
        return {};
    }
};
