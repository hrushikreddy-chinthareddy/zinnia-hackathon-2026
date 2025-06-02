import { PolicyPartyRoles } from '@zinnia/api-types/types/sor';

import { Party } from '@deps/models/policy-sor-touchups/Party';

export interface EditableCardProps {
    editable?: boolean;
    infoOnly?: boolean;
}

export interface PersonCardProps extends EditableCardProps {
    party?: Party;
    partyRoles: PolicyPartyRoles[];
    planCode?: string;
    policyNumber?: string;
}
