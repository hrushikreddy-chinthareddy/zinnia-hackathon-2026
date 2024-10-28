// TODO - Brian fix this
/* eslint-disable @typescript-eslint/no-duplicate-enum-values */

import { CaseOwner } from './case-owner';
import { SignatureValidation } from './signature-validation';

export enum Channel {
    Form = 'Email/Fax/Mail',
    Phone = 'Phone',
}

export enum RenewalPeriod {
    ThreeYear = '3 Year Guarantee Period',
    FourYear = '4 Year Guarantee Period',
    FiveYear = '5 Year Guarantee Period',
    SevenYear = '7 Year Guarantee Period',
}

export type CaseRenewal = {
    caseId: string;
    contractId: string;
    email: string;
    phoneNumber: string;
    primaryOwner: CaseOwner;
    jointOwner: CaseOwner;
    renewalPeriod: RenewalPeriod;
    signatureValidation: SignatureValidation;
    signatureValidationJointOwner: SignatureValidation;
};
