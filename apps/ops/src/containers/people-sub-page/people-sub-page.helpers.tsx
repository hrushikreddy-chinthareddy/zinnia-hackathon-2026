import {
    PartyRole,
    PartyType,
    Party,
    PolicyPartyRoles,
} from '@zinnia/api-types/types/sor';
import { TFunction } from 'next-i18next';

import { PartyRoleChipToText } from '@deps/constants/party-roles';
import {
    orderObjectsByFirstString,
    orderObjectsByString,
    sortByAndThenBy,
} from '@deps/helpers/sort.helpers';
import { TagKey } from '@deps/types/components';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import {
    AgentType,
    BeneficiaryType,
} from '../people-card-container/people-card-container.types';

// Role Count

// RoleCountItem - "text" is the chip text and "value" is the original partyRole from the response
interface RoleCountItem {
    value: string;
    text: string;
    quantity: number;
}

// TODO MG: move this somewhere more generic
export const convertToChipText = (text: string | undefined, t: TFunction) => {
    if (text === '' || text == null) return DEFAULT_ERROR_STRING;

    switch (text.toLowerCase()) {
        case PartyRoleChipToText.Insured:
            return t('chipFilter.partyRole.insured');
        case PartyRoleChipToText.Annuitant:
            return t('chipFilter.partyRole.annuitant');
        case PartyRoleChipToText.Payee:
            return t('chipFilter.partyRole.payee');
        case PartyRoleChipToText.Payor:
            return t('chipFilter.partyRole.payor');
        case PartyRoleChipToText.Owner:
            return t('chipFilter.partyRole.owner');
        case PartyRoleChipToText.Beneficiary:
            return t('chipFilter.partyRole.beneficiary');
        case PartyRoleChipToText.PrimaryBeneficiary:
            return t('chipFilter.partyRole.primarybeneficiary');
        case PartyRoleChipToText.ContingentBeneficiary:
            return t('chipFilter.partyRole.contingentbeneficiary');
        case PartyRoleChipToText.Agent:
            return t('chipFilter.partyRole.agent');
        case PartyRoleChipToText.SellingAgent:
            return t('chipFilter.partyRole.sellingagent');
        case PartyRoleChipToText.ServicingAgent:
        case PartyRoleChipToText.PrimaryServicingAgent:
            return t('chipFilter.partyRole.servicingagent');
        case PartyRoleChipToText.CommissionAgent:
            return t('chipFilter.partyRole.commissionagent');
        case PartyRoleChipToText.ThirdPartyDesignee:
            return t('chipFilter.partyRole.thirdPartyDesignee');
        case PartyRoleChipToText.JointAnnuitant:
            return t('chipFilter.partyRole.jointAnnuitant');
        case PartyRoleChipToText.PrimaryOwner:
            return t('chipFilter.partyRole.owner');
        case PartyRoleChipToText.PolicyJointOwner:
        case PartyRoleChipToText.JointOwner:
            return t('chipFilter.partyRole.jointOwner');
        case PartyRoleChipToText.JointOwnerDifferentAddress:
            return t('chipFilter.partyRole.jointOwner');
        case PartyRoleChipToText.JointOwnerSameAddress:
            return t('chipFilter.partyRole.jointOwner');
        case PartyRoleChipToText.AgentOfRecord:
            return t('chipFilter.partyRole.agentOfRecord');
        case PartyRoleChipToText.Assignee:
            return t('chipFilter.partyRole.assignee');
        case PartyRoleChipToText.RiderInsured:
            return t('chipFilter.partyRole.riderInsured');
        // vvv may default to owner, awaiting design feedback on this vvv
        case PartyRoleChipToText.OwnerDeceased:
            return t('chipFilter.partyRole.deceasedOwner');
        case PartyRoleChipToText.PrimaryWritingAgent:
            return t('chipFilter.partyRole.primaryWritingAgent');
        case PartyRoleChipToText.AdditionalWritingAgent:
            return t('chipFilter.partyRole.additionalWritingAgent');
        case PartyRoleChipToText.ExchangeCompany:
            return t('chipFilter.partyRole.exchangeCompany');
        default:
            return text;
    }
};

// Generalize partyRole into a category or return original partyRole
export const normalizePartyRole = (partyRole: PartyRole): string => {
    if (
        partyRole === 'PRIMARYBENEFICIARY' ||
        partyRole === 'CONTINGENTBENEFICIARY'
    ) {
        return 'beneficiary';
    } else if (
        partyRole === 'PRIMARYWRITINGAGENT' ||
        partyRole === 'PRIMARYSERVICINGAGENT' ||
        partyRole === 'ADDITIONALSERVICINGAGENT' ||
        partyRole === 'ADDITIONALWRITINGGAGENT' ||
        partyRole === 'AGENT'
    ) {
        return 'agent';
    }
    return partyRole;
};

export const simplifyPartyRoles = (partyRole: PartyRole): string => {
    switch (partyRole) {
        case PartyRole.PRIMARYBENEFICIARY:
            return 'beneficiary';
        case PartyRole.CONTINGENTBENEFICIARY:
            return 'contingentbeneficiary';
        case PartyRole.AGENT:
        case PartyRole.ADDITIONALSERVICINGAGENT:
        case PartyRole.PRIMARYSERVICINGAGENT:
            return 'agent';
        case PartyRole.PRIMARYWRITINGAGENT:
        case PartyRole.ADDITIONALWRITINGGAGENT:
            return 'agentofrecord';
        default:
            return partyRole;
    }
};

// Count the occurrence of each partyRole or generalized category, and create an array of RoleCountItems
// arranged in hierarchical order
export const countPartyRoles = (
    arr: Array<PolicyPartyRoles>,
    t: TFunction
): Array<RoleCountItem> => {
    const roleCount: Record<string, number> = {};

    arr.forEach((obj) => {
        if (obj.partyRole) {
            const normalizedRole = normalizePartyRole(obj.partyRole);

            if (roleCount[normalizedRole]) {
                roleCount[normalizedRole]++;
            } else {
                roleCount[normalizedRole] = 1;
            }
        }
    });

    const roleCountItems = Object.entries(roleCount).map(
        ([value, quantity]) => ({
            value,
            text: convertToChipText(value, t),
            quantity,
        })
    );

    // Arrange according to hierarchy
    const orderedRoles: string[] = t('colDefs:people.chipOrderedRoles', {
        returnObjects: true,
    });
    const orderedRoleCountItems = orderObjectsByString(
        roleCountItems,
        orderedRoles,
        'text'
    );
    return orderedRoleCountItems;
};

// Name Tag
export interface NameTag extends Party {
    tags: TagKey[];
    partyRoles: string[];
    partyRoleIds: any[];
}

export const combineNameAndRoles = (
    policyPartiesArr: Party[],
    partyRolesArr: PolicyPartyRoles[],
    t: TFunction
): NameTag[] => {
    let nameTags: NameTag[] = [];
    const orderedTags: string[] = t('colDefs:people.orderedRoles', {
        returnObjects: true,
    });

    partyRolesArr.forEach((partyRoleObj) => {
        const partyRole = partyRoleObj.partyRole || '';
        const partyRoleId = partyRoleObj?.partyRoleId || '';
        const convertedPartyRole: TagKey = {
            text: convertToChipText(partyRole, t),
        };
        const policyParty = policyPartiesArr.find(
            (pp) => pp.partyId === partyRoleObj.partyId
        );
        const partyType = policyParty?.partyType || '';

        if (!policyParty) return;

        /*
            Here, I used fullName for trusts and organizationCode for organizations. This reflects the way names are shown
            in identification-card.tsx for example. These names get displayed in the people cards and have a PII Wrapper on them
            in card-people.tsx.
        */
        const {
            firstName,
            lastName,
            fullName,
            organizationCode,
            beneficiaryPercentage,
            partyId,
        } = policyParty;

        const existingNameTag = nameTags.find((nt) => {
            return nt.partyId === partyId;
        });

        if (existingNameTag) {
            const roleIndex = existingNameTag.partyRoles.indexOf(partyRole);
            if (roleIndex === -1) {
                existingNameTag.partyRoles.push(partyRole);
                existingNameTag.tags.push(convertedPartyRole);
                existingNameTag?.partyRoleIds?.push(partyRoleId);
            }
        } else {
            const nameTag = {
                ...policyParty,
                beneficiaryPercentage,
                tags: [convertedPartyRole],
                partyRoles: [partyRole],
                partyRoleIds: [partyRoleId],
            };

            switch (partyType) {
                case PartyType.INDIVIDUAL:
                    nameTag.firstName = firstName;
                    nameTag.lastName = lastName;
                    break;
                case PartyType.TRUST:
                    nameTag.fullName = fullName;
                    break;
                case PartyType.ORGANIZATION:
                    nameTag.organizationCode = organizationCode;
                    break;
            }

            nameTags.push(nameTag);
        }
    });

    nameTags = nameTags.map((nt) => ({
        ...nt,
        tags: orderObjectsByString(nt.tags, orderedTags, 'text'),
    }));
    nameTags = orderObjectsByFirstString(nameTags, orderedTags, 'tags');

    return nameTags;
};

// This will convert the selected chipText into acceptable, lowercase-
// tag text that is then used to determine if tag isSelected in CardPeople
export const convertToTagText = (value: string, t: TFunction): string[] => {
    switch (value) {
        case 'beneficiary':
            return [
                t('chipFilter.partyRole.primarybeneficiary')?.toLowerCase(),
                t('chipFilter.partyRole.contingentbeneficiary')?.toLowerCase(),
            ];
        case 'agent':
            return [
                t('chipFilter.partyRole.sellingagent'),
                t('chipFilter.partyRole.commissionagent'),
                t('chipFilter.partyRole.servicingagent')?.toLocaleLowerCase(),
                t('chipFilter.partyRole.agentOfRecord')?.toLocaleLowerCase(),
                t('chipFilter.partyRole.agent')?.toLocaleLowerCase(),
            ];
        default:
            return [convertToChipText(value, t).toLowerCase()];
    }
};

// Sort by allocation percentage and then by first name then by last
export const beneficiaryDataByType = (data: NameTag[], type: BeneficiaryType) =>
    sortByAndThenBy<NameTag>(
        data.filter((nameTag) =>
            nameTag.partyRoles.some(
                (partyRole) =>
                    simplifyPartyRoles(partyRole as PartyRole) ===
                    type.toLocaleLowerCase()
            )
        ),
        'beneficiaryPercentage',
        'firstName',
        'lastName'
    );

export const agentDataByType = (data: NameTag[], type: AgentType) =>
    sortByAndThenBy<NameTag>(
        data.filter((nameTag) =>
            nameTag.partyRoles.some(
                (partyRole) =>
                    simplifyPartyRoles(partyRole as PartyRole) ===
                    type.toLocaleLowerCase()
            )
        ),
        'agentPercentage',
        'firstName',
        'lastName'
    );
