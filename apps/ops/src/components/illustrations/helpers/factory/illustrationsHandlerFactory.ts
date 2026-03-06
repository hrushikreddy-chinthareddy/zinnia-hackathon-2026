import { IllustrationsClientCase } from '@deps/types/illustrations';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';

import { PlanIU0101Handler } from './planIU0101Hander';
import { PlanTL0101Handler } from './planTL0101Hander';
import { PlanTR0101Handler } from './planTR0101Handler';

export function IllustrationHandlerFactory(
    planCode: string,
    clientCase?: IllustrationsClientCase,
    featureFlags?: FeatureFlags
) {
    if (!clientCase) return null;

    switch (planCode) {
        case 'TL0101':
            return new PlanTL0101Handler(clientCase);
        case 'IU0101':
            return new PlanIU0101Handler(clientCase, featureFlags);
        case 'TR0101':
            return new PlanTR0101Handler(clientCase);
        default:
            return null;
    }
}
