export type DefaultDataEntryTask = {
    caseDetails: {
        caseType: string;
        caseSubType: string;
        contractNumber: string;
        carrier: string;
        customerDetails?: {
            firstName: string;
            lastName: string;
            taxId: string;
            payorId?: string;
        };
        callDetails?: {
            callerRole: string;
            associateName: string;
            callerName: string;
            callerPhone: string;
        };
        reporterDetails?: {
            requestedBy: string;
            referenceCaseId: string;
        };
        additionalDetails?: {
            //LI Representative Address and Phone Change
            address?: {
                addressLine1: string;
                addressLine2: string;
                addressLine3: string;
                city: string;
                country: string;
                state: string;
                zip: string;
                zipPlusFour: string;
            };
            newAddressEffectiveDate?: string;
            currentPhoneNumber?: string;
            businessPhone?: string;
            faxNumber?: string;
            newPhoneNumber?: string;
            newBusinessPhone?: string;
            newFaxNumber?: string;
            comments: string;
            // NB Supporting Document
            lob?: string;
            contractNumber?: string;
            contractOwnerTaxId?: string;
            //NF Fix
            callDateAndTime?: string;
            //Stop pay request
            additionalContractNumber?: string;
            externalId?: string;
            callerRelationshipToContract?: string;
        };
    };
    attachments?: any[];
    correctionDetails?: {
        reason: string;
        referenceCaseId: string;
        requestedBy: string;
        requestedOn: string;
        note: string;
    };
};

export enum RequestType {
    Ops_Service_Request = 'opsreview',
    Case_Service_Request = 'servicerequest',
}
