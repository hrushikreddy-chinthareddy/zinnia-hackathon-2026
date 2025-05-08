import { BadgeVariant } from '@deps/components/badge/badge.helpers';
import { PolicyStatus, ProductType } from '@deps/models/policy/sor-policy';

import { PopoverPlacement } from '../popover/popover';

export interface GlobalValues {
    carrierId?: string;
    carrierOrganizationName?: string;
    productType?: ProductType;
    marketingName?: string;
    policyNumber?: string;
    planName?: string;
    planCode?: string;
    glPlanCode?: string;
    status: PolicyStatus;
    variant: BadgeVariant;
    tooltip: string;
    tooltipDate?: string;
    tooltipAmount?: string;
    tooltipPlacements?: PopoverPlacement;
    highlight?: string;
    openSideSheet?: () => void;
}
