import { formatAccountNumber, formatSSN } from '@deps/helpers/string.helper';
import { Case } from '@deps/models/case/case';
import { DocumentInstance } from '@deps/models/case/document-instance';
import { LifeCadParty } from '@deps/models/case/lifecad-party';
import { PartyInstance } from '@deps/models/case/party-instance';
import { StepInstance } from '@deps/models/case/step-instance';
import {
    Address,
    BankAccount,
    Email,
    Identification,
    IdentificationType,
    Party,
    Phone,
    Policy,
    PolicyAllOfPartiesItem,
    State,
    TaxWithholding,
} from '@deps/models/policy/sor-policy';
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

const toMaskedStringOrNull = (value: string | null | undefined): string | null => {
    return value ? `${value}`.replace(/./g, '*') : null;
};

const fullyMaskAddress = (address: Address | undefined): Address | undefined => {
    if (!address) {
        return undefined;
    }
    return {
        ...address,
        addressLine1: toMaskedStringOrNull(address?.addressLine1),
        addressLine2: toMaskedStringOrNull(address?.addressLine2),
        addressLine3: toMaskedStringOrNull(address?.addressLine3),
        city: toMaskedStringOrNull(address?.city),
        state: toMaskedStringOrNull(address?.state) as State | undefined,
        zipCode: toMaskedStringOrNull(address?.zipCode),
        zipCodeExtension: toMaskedStringOrNull(address?.zipCodeExtension),
    } as Address;
};

const fullyMaskBankDetails = (bankDetails: BankAccount[] | undefined): BankAccount[] | undefined => {
    return bankDetails?.map(bankDetail => {
        return {
            ...bankDetail,
            accountNumber: toMaskedStringOrNull(bankDetail?.accountNumber),
            accountType: undefined,
            branchAddress: fullyMaskAddress(bankDetail?.branchAddress),
            branchName: toMaskedStringOrNull(bankDetail?.branchName),
            branchPhoneNumber: toMaskedStringOrNull(bankDetail?.branchPhoneNumber),
            internationalBankAccountNumber: toMaskedStringOrNull(bankDetail?.internationalBankAccountNumber),
            nameOnAccount: toMaskedStringOrNull(bankDetail?.nameOnAccount),
            routingNumber: toMaskedStringOrNull(bankDetail?.routingNumber),
        } as BankAccount;
    });
};

const fullyMaskEmails = (emails: Email[] | undefined): Email[] | undefined => {
    return emails?.map(email => {
        return {
            ...email,
            emailAddress: toMaskedStringOrNull(email?.emailAddress),
            emailType: undefined,
        } as Email;
    });
};

const fullyMaskIdentifications = (identifications: Identification[] | undefined): Identification[] | undefined => {
    return identifications?.map(identification => {
        return {
            ...identification,
            identificationValue: identification.identificationValue?.replace(/./g, '*') || undefined,
        };
    });
};

const fullyMaskPhones = (phones: Phone[] | undefined): Phone[] | undefined => {
    return phones?.map(phone => {
        return {
            ...phone,
            areaCode: phone?.areaCode?.replace(/./g, '*') || undefined,
            bestTime: toMaskedStringOrNull(phone?.bestTime),
            countryCode: phone?.countryCode?.replace(/./g, '*') || undefined,
            dialNumber: phone?.dialNumber?.replace(/./g, '*') || undefined,
            extension: phone?.extension?.replace(/./g, '*') || undefined,
            phoneType: undefined,
            timezone: undefined,
        } as Phone;
    });
};

const fullyMaskTaxWithholdings = (taxWithholdings: TaxWithholding[] | undefined): TaxWithholding[] | undefined => {
    return taxWithholdings;
};

const fullyMaskPolicyParties = (parties: PolicyAllOfPartiesItem[] | undefined): PolicyAllOfPartiesItem[] | undefined => {
    return parties?.map(
        ({
            abbreviatedName,
            addresses,
            attainedAge,
            bankDetails,
            dateOfBirth,
            emails,
            firstName,
            formerName,
            fullName,
            identifications,
            insured,
            lastName,
            middleName,
            phones,
            preferredAddressIndicator,
            preferredCommunicationType,
            prefix,
            suffix,
            taxWithholdings,
            trustAccessCode,
            trustDate,
            trustTitle,
            trustType,
            ...rest
        }) => {
            return {
                ...rest,
                abbreviatedName: toMaskedStringOrNull(abbreviatedName),
                addresses: addresses?.map(fullyMaskAddress) as Address[] | undefined,
                bankDetails: fullyMaskBankDetails(bankDetails),
                dateOfBirth: 'XXXX-XX-XX',
                emails: fullyMaskEmails(emails),
                firstName: toMaskedStringOrNull(firstName),
                fullName: toMaskedStringOrNull(fullName),
                identifications: fullyMaskIdentifications(identifications),
                lastName: toMaskedStringOrNull(lastName),
                middleName: toMaskedStringOrNull(middleName),
                phones: fullyMaskPhones(phones),
                taxWithholdings: fullyMaskTaxWithholdings(taxWithholdings),
            } as PolicyAllOfPartiesItem;
        }
    );
};

export const policyMasker = (policy: Policy): Policy => {
    const { parties, ...rest } = policy;
    return { ...rest, parties: fullyMaskPolicyParties(parties) };
};

export const fullyMaskPolicyResponse = (policyResponse: GetPolicyResponse): GetPolicyResponse => {
    try {
        const policy = policyMasker(policyResponse.data);
        return { ...policyResponse, data: policy };
    } catch (e) {
        logError('sanitizers::fullyMaskPolicyResponse::error', { ...parseErrorInformation(e) });
        throw e;
    }
};

const fullyMaskSteps = (steps: StepInstance[] | undefined): StepInstance[] | undefined => {
    return steps?.map(({ instanceInfo, ...rest }) => {
        return {
            ...rest,
            ...(instanceInfo
                ? {
                      instanceInfo: {
                          ...instanceInfo,
                          label: toMaskedStringOrNull(instanceInfo?.label) as string,
                      },
                  }
                : { instanceInfo: null }),
        } as StepInstance;
    });
};

const fullyMaskCaseParties = (parties: PartyInstance[] | undefined): PartyInstance[] | undefined => {
    return parties?.map(({ firstName, lastName, ssn, fullName, middleName, ...rest }) => {
        return {
            firstName: toMaskedStringOrNull(firstName) as string,
            fullName: toMaskedStringOrNull(fullName) as string,
            lastName: toMaskedStringOrNull(lastName) as string,
            middleName: toMaskedStringOrNull(middleName) as string,
            ssn: toMaskedStringOrNull(ssn) as string,
            ...rest,
        };
    });
};

const fullyMaskDocuments = (documents: DocumentInstance[] | undefined): DocumentInstance[] | undefined => {
    return documents?.map(document => {
        return {
            ...document,
            name: toMaskedStringOrNull(document?.name) as string,
        };
    });
};

// Fully masks PII inside of a case
// Dev Notes: AdditionalData and Events are returned as empty instead of masking, as the schemas are not fully known and have historically been places where PII leaks can occur
export const fullyMaskCase = (caseData: Case): Case => {
    const { parties, documents, additionalData, stages, events, ...rest } = caseData;
    return {
        ...rest,
        additionalData: {},
        documents: fullyMaskDocuments(documents) as DocumentInstance[],
        events: [],
        stages: stages.map(({ steps, ...rest }) => ({ steps: fullyMaskSteps(steps), ...rest })),
        parties: fullyMaskCaseParties(parties) as PartyInstance[],
    };
};

// Sanitizes case search by:
// Masking ssns in a case's party array
export const caseSearchFullMasker = ({ data, ...rest }: CaseSearchResponse): CaseSearchResponse => {
    try {
        return { data: data.map(d => fullyMaskCase(d)), ...rest };
    } catch (e) {
        logError('Error sanitizing case search results', { ...parseErrorInformation(e) });
        throw e;
    }
};
