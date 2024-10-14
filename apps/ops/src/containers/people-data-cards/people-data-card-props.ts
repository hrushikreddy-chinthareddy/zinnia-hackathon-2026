import { PolicyAllOfPartiesItem, PolicyParties } from '@deps/models/policy/sor-policy';

export interface EditableCardProps {
    editable?: boolean;
    infoOnly?: boolean;
}

export interface PersonCardProps extends EditableCardProps {
    party?: PolicyAllOfPartiesItem;
    partyRoles: PolicyParties[];
    planCode?: string;
    policyNumber?: string;
}
