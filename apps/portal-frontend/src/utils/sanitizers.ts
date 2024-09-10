import { formatAccountNumber, formatSSN } from '@deps/helpers/string.helper';
import { Case } from '@deps/models/case/case';
import { LifeCadParty } from '@deps/models/case/lifecad-party';
import { PartyInstance } from '@deps/models/case/party-instance';
import { BankAccount, Identification, IdentificationType, Party, Policy } from '@deps/models/policy/sor-policy';
import { GetPolicyResponse } from '@deps/queries/api/policies';
import { CaseSearchResponse } from '@deps/types/search';

import { logError, parseErrorInformation } from './server-logging';

interface SanitizeOptions {
    isDemoUser: boolean;
}

export interface SanitizerFn<T> {
    (arg: T, options?: SanitizeOptions): T;
}

// masks ssns in a case's party array
const sanitizeCaseParties = (parties: PartyInstance[]): PartyInstance[] => {
    return parties.map(party => {
        return { ...party, ...(party.ssn && { ssn: formatSSN(party.ssn) }) };
    });
};

export const caseSanitizer = ({ parties, carrier, ...rest }: Case, options?: SanitizeOptions): Case => {
    return {
        ...rest,
        parties: sanitizeCaseParties(parties),
        carrier: options?.isDemoUser ? 'zinnia' : carrier,
    };
};

// Sanitizes case search by:
// Masking ssns in a case's party array
export const caseSearchSanitizer = ({ data, ...rest }: CaseSearchResponse, options?: SanitizeOptions): CaseSearchResponse => {
    try {
        return { data: data.map(d => caseSanitizer(d, options)), ...rest };
    } catch (e) {
        logError('Error sanitizing case search results', { ...parseErrorInformation(e) });
        throw e;
    }
};

const sanitizeBankDetails = (bankDetails: BankAccount[] | undefined): BankAccount[] | undefined => {
    return bankDetails?.map(({ internationalBankAccountNumber, accountNumber, ...rest }) => {
        return {
            ...rest,
            accountNumber: formatAccountNumber(accountNumber),
            internationalBankAccountNumber: formatAccountNumber(internationalBankAccountNumber as string),
        };
    });
};

export const sanitizeIdentifications = (identifications: Identification[] | undefined): Identification[] | undefined => {
    return identifications?.map(identification => {
        if (identification.identificationType === IdentificationType.SSN) {
            return { ...identification, identificationValue: formatSSN(identification.identificationValue) };
        }
        return identification;
    });
};

const sanitizePolicyParty = ({ bankDetails, identifications, ...restOfParty }: Party): Party => {
    const sanitizedBankDetails = sanitizeBankDetails(bankDetails);
    const sanitizedIdentifications = sanitizeIdentifications(identifications);
    return { ...restOfParty, bankDetails: sanitizedBankDetails, identifications: sanitizedIdentifications };
};

// Sanitizes policies by:
// Masking ssns in a policy's party array
export const policySanitizer = ({ parties = [], ...rest }: Policy): Policy => {
    try {
        const sanitizedParties = parties.map(sanitizePolicyParty);
        return { ...rest, parties: sanitizedParties };
    } catch (e) {
        logError('sanitizers::policySanitizers::error', { ...parseErrorInformation(e) });
        throw e;
    }
};

// Sanitizes policies by bank details only
// Not masking ssn's in a policy's party array as per address change requirement 
// Need ssn non formatted one and unmasked
export const policySanitizerWithoutSSN = ({ parties = [], ...rest }: Policy): Policy => {
    try {
        const sanitizedParties = parties.map(sanitizePolicyPartyWithoutSSN);
        return { ...rest, parties: sanitizedParties };
    } catch (e) {
        logError('sanitizers::policySanitizers::error', { ...parseErrorInformation(e) });
        throw e;
    }
};

const sanitizePolicyPartyWithoutSSN = ({ bankDetails, ...restOfParty }: Party): Party => {
    const sanitizedBankDetails = sanitizeBankDetails(bankDetails);
    return { ...restOfParty, bankDetails: sanitizedBankDetails };
};


export const policyResponseSanitizer = (policyResponse: GetPolicyResponse): GetPolicyResponse => {
    try {
        const policy = policySanitizer(policyResponse.data);
        return { ...policyResponse, data: policy };
    } catch (e) {
        logError('sanitizers::policyResponseSanitizer::error', { ...parseErrorInformation(e) });
        throw e;
    }
};

export const lcPartyResponseSanitizer = (partyResponse: LifeCadParty[] = []): LifeCadParty[] => {
    try {
        return partyResponse.map(val => {
            return { ...val, TaxID: formatSSN(`${val.TaxID}`) };
        });
    } catch (e) {
        logError('sanitizers::lcPartyResponseSanitizer::error', { ...parseErrorInformation(e) });
        throw e;
    }
};
