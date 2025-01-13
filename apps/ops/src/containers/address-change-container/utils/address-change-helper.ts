import { Channel } from '@deps/models/case/renewal/case-renewal';
import { SignatureWithdrawal } from '@deps/models/case/withdrawal/case';
import { Party, PartyRole, PartyType, PolicyParties } from '@deps/models/policy/sor-policy';

import { SignatureState } from '../types/address-change-types';

const CodesForJointOption = ['2', '4'];

// Commented logic for isRoleWithJointOption as current check is based on PartyRole
export const getRoleToLabelKeyMap = (partyRole: string) => {
    switch (partyRole) {
        case PartyRole.JOINTAANUITANT:
            return 'common.partyRole.annuitantWithJoint';
        case PartyRole.JOINTOWNER:
            return 'common.partyRole.ownerWithJoint';
        case PartyRole.OWNER:
            // return isRoleWithJointOption(partyRoleId) ? 'common.partyRole.ownerWithJoint' : 'common.partyRole.owner';
            return 'common.partyRole.owner';
        case PartyRole.PAYEE:
            return 'common.partyRole.payee';
        case PartyRole.INSURED:
        case PartyRole.ANNUITANT:
            //return isRoleWithJointOption(partyRoleId) ? 'common.partyRole.annuitantWithJoint' : 'common.partyRole.annuitant';
            return 'common.partyRole.annuitant';
        case PartyRole.PRIMARYBENEFICIARY:
            return 'common.partyRole.primaryBeneficiary';
        case PartyRole.PAYOR:
            return 'common.partyRole.payor';
        case PartyRole.AGENT:
            return 'common.partyRole.agent';
        case PartyRole.PRIMARYWRITINGAGENT:
            return 'common.partyRole.primaryWritingAgent';
        case PartyRole.PRIMARYSERVICINGAGENT:
            return 'common.partyRole.primaryServicingAgent';
        case PartyRole.THIRDPARTYDESIGNEE:
            return 'common.partyRole.thirdPartyDesignee';
        case PartyRole.EDELIVERY:
            return 'common.partyRole.e-delivery';
        case PartyRole.CONTINGENTBENEFICIARY:
            return 'common.partyRole.contingentBenefeciary';
        default:
            return '';
    }
};

const isRoleWithJointOption = (partyRoleId: string) => {
    const roleIdOption = partyRoleId.split('|')[1];
    if (!roleIdOption) return false;
    return CodesForJointOption.includes(roleIdOption);
};

export const isJointOwnerExist = (partyRoles: PolicyParties[]) => {
    return !!partyRoles?.find(
        item => item.partyRole === PartyRole.OWNER && isRoleWithJointOption(item?.partyRoleId?.toString() ?? '')
    );
};

export const isJointOwnerPresent = (partyRoles: PolicyParties[]) => {
    return !!partyRoles?.find(item => item.partyRole === PartyRole.JOINTOWNER)
};

export const transformSignatureStateToPayload = (data: SignatureState | null) => {
    if (!data) return {};

    return {
        signatureData: {
            signatures: data.signatures.map((item: SignatureWithdrawal) => ({
                signType: item.signType.text,
                isSignedPresent: item.isSigned,
                signDate: item.signDate.text,
                signPrintName: item.signName,
            })),
        },
    };
};

export const getChannel = (documentId: string): Channel => {
    if (documentId) {
        if (documentId.includes('-O-')) {
            return Channel.Phone;
        } else {
            return Channel.Form;
        }
    } else {
        return Channel.Phone;
    }
}

export const isAnnuitantSignatureRequired = (partyRoles: PolicyParties[], parties: Party[]) => {
    const partyItem = partyRoles?.find(item => item.partyRole === PartyRole.OWNER);
    if (!partyItem) return false;

    const policyParty = parties.find(pp => pp.partyId === partyItem?.partyId);
    if (!policyParty) return false;

    return policyParty.partyType === PartyType.ORGANIZATION || policyParty.partyType === PartyType.TRUST;
};
