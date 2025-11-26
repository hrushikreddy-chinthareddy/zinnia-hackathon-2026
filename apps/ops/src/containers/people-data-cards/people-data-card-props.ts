import { Party } from '@deps/models/policy-sor-touchups/Party';
import { PolicyPartyRoles } from '@zinnia/api-types/types/sor';

export interface EditableCardProps {
    editable?: boolean;
    infoOnly?: boolean;
}

export interface PersonCardProps extends EditableCardProps {
    party?: Party;
    partyRoles: PolicyPartyRoles[];
    planCode?: string;
    policyNumber?: string;
    isUserPermissionedToEditCards?: boolean;
}
