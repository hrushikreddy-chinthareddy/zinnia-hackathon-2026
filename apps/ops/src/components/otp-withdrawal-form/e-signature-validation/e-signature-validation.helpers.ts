import { FormParty, PartyRoles } from '@deps/models/case/withdrawal/case';

export enum SelectionStateYesNo {
    No = 'No',
    Unselected = 'Unselected',
    Yes = 'Yes',
}

export interface ESignature {
    signType: { text: string };
    isSigned: boolean | null;
    signDate: { text: string };
    isAuditTrail?: boolean | null;
    isAccordForm?: boolean | null;
}

export interface FormEsignatureData {
    isFormESignaturePresent: boolean;
    eSignatures: Array<ESignature>;
}

export const getESignatureData = (formParty: FormParty) => {
    const hasJointOwner = !!formParty?.parties?.find(item => item.partyRoleType === PartyRoles.JOINT_OWNER);
    return {
        eSignatures: [
            {
                isSigned: null,
                signDate: {
                    text: null,
                },
                signType: {
                    text: 'Owner',
                },
                isAuditTrail: null,
                isAccordForm: null,
            },
            hasJointOwner
                ? {
                      isSigned: null,
                      signDate: {
                          text: null,
                      },
                      signType: {
                          text: 'Joint Owner',
                      },
                      isAuditTrail: null,
                      isAccordForm: null,
                  }
                : null,
        ].filter(Boolean),
        isFormESignaturePresent: false,
    };
};
