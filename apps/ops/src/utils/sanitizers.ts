import { POM_Producer_Models_SearchProducersResult } from '@zinnia/api-types/types/pom';
import {
    Address,
    BankAccount,
    Email,
    Identification,
    IdentificationType,
    Phone,
    Policy,
    PolicyCoverage,
    State,
    TaxWithholding,
} from '@zinnia/api-types/types/sor';
import { ApiError } from 'next/dist/server/api-utils';

import {
    formatAccountNumber,
    formatSSN,
    isNullEmptyOrUndefined,
} from '@deps/helpers/string.helpers';
import { Case } from '@deps/models/case/case';
import { DocumentInstance } from '@deps/models/case/document-instance';
import { LifeCadParty } from '@deps/models/case/lifecad-party';
import { PartyInstance } from '@deps/models/case/party-instance';
import { StepInstance } from '@deps/models/case/step-instance';
import { Party } from '@deps/models/policy-sor-touchups/Party';
import { GetPolicyResponse } from '@deps/queries/api/policies';
import {
    AgentAddress,
    AgentData,
    AgentDataResponse,
    AgentEmail,
    AgentPhone,
} from '@deps/types/agents';
import {
    CaseSearchResponse,
    PolicyReferenceSearchResponse,
} from '@deps/types/search';

import {
    logErrorWithoutContext,
    parseErrorInformation,
} from './server-logging';

interface SanitizeOptions {
    isDemoUser: boolean;
}

export interface SanitizerFn<T> {
    (arg: T, options?: SanitizeOptions): T;
}

// masks ssns in a case's party array
const sanitizeCaseParties = (parties: PartyInstance[]): PartyInstance[] => {
    return parties.map((party) => {
        return { ...party, ...(party.ssn && { ssn: formatSSN(party.ssn) }) };
    });
};

export const caseSanitizer = (
    { parties, carrier, ...rest }: Case,
    options?: SanitizeOptions
): Case => {
    return {
        ...rest,
        parties: sanitizeCaseParties(parties),
        carrier: options?.isDemoUser ? 'zinnia' : carrier,
    };
};

// Sanitizes case search by:
// Masking ssns in a case's party array
export const caseSearchSanitizer = (
    { data, ...rest }: CaseSearchResponse,
    options?: SanitizeOptions
): CaseSearchResponse => {
    try {
        return { data: data.map((d) => caseSanitizer(d, options)), ...rest };
    } catch (e) {
        logErrorWithoutContext('Error sanitizing case search results', {
            ...parseErrorInformation(e),
        });
        throw new ApiError(
            500,
            `caseSearchSanitizer::error sanitizing case search results: ${
                (e as Error).message
            }`
        );
    }
};

export const sanitizeBankDetails = (
    bankDetails: BankAccount[] | undefined
): BankAccount[] | undefined => {
    return bankDetails?.map(
        ({ internationalBankAccountNumber, accountNumber, ...rest }) => {
            return {
                ...rest,
                accountNumber: accountNumber,
                maskedAccountNumber: formatAccountNumber(accountNumber),
                internationalBankAccountNumber: formatAccountNumber(
                    internationalBankAccountNumber as string
                ),
            };
        }
    );
};

export const sanitizeIdentifications = (
    identifications: Identification[] | undefined
): Identification[] | undefined => {
    return identifications?.map((identification) => {
        if (identification.identificationType === IdentificationType.SSN) {
            return {
                ...identification,
                identificationValue: formatSSN(
                    identification.identificationValue
                ),
            };
        }
        return identification;
    });
};

const sanitizePolicyParty = ({
    bankDetails,
    identifications,
    ...restOfParty
}: Party): Party => {
    const sanitizedBankDetails = sanitizeBankDetails(bankDetails);
    const sanitizedIdentifications = sanitizeIdentifications(identifications);
    return {
        ...restOfParty,
        bankDetails: sanitizedBankDetails,
        identifications: sanitizedIdentifications,
    };
};

// Sanitizes policies by:
// Masking ssns in a policy's party array
export const policySanitizer = ({ parties = [], ...rest }: Policy): Policy => {
    try {
        const sanitizedParties = parties.map(sanitizePolicyParty);
        return { ...rest, parties: sanitizedParties };
    } catch (e) {
        logErrorWithoutContext('sanitizers::policySanitizers::error', {
            ...parseErrorInformation(e),
        });
        throw new ApiError(
            500,
            `policySanitizer::error sanitizing policy: ${(e as Error).message}`
        );
    }
};

// Sanitizes policies by bank details only
// Not masking ssn's in a policy's party array as per address change requirement
// Need ssn non formatted one and unmasked
export const policySanitizerWithoutSSN = ({
    parties = [],
    ...rest
}: Policy): Policy => {
    try {
        const sanitizedParties = parties.map(sanitizePolicyPartyWithoutSSN);
        return { ...rest, parties: sanitizedParties };
    } catch (e) {
        logErrorWithoutContext('sanitizers::policySanitizers::error', {
            ...parseErrorInformation(e),
        });
        throw new ApiError(
            500,
            `policySanitizerWithoutSSN::error sanitizing policy: ${
                (e as Error).message
            }`
        );
    }
};

const sanitizePolicyPartyWithoutSSN = ({
    bankDetails,
    ...restOfParty
}: Party): Party => {
    const sanitizedBankDetails = sanitizeBankDetails(bankDetails);
    return { ...restOfParty, bankDetails: sanitizedBankDetails };
};

export const policyResponseSanitizer = (
    policyResponse: GetPolicyResponse
): GetPolicyResponse => {
    try {
        const policy = policySanitizer(policyResponse.data);
        return { ...policyResponse, data: policy };
    } catch (e) {
        logErrorWithoutContext('sanitizers::policyResponseSanitizer::error', {
            ...parseErrorInformation(e),
        });
        throw new ApiError(
            500,
            `policyResponseSanitizer::error sanitizing policyResponse: ${
                (e as Error).message
            }`
        );
    }
};

export const policySearchResponseSanitizer = (
    policySearchResponse: PolicyReferenceSearchResponse
): PolicyReferenceSearchResponse => {
    try {
        const results = policySearchResponse.results.map((party) => {
            return { ...party, ssn: formatSSN(party.ssn) };
        });
        return { ...policySearchResponse, results };
    } catch (e) {
        logErrorWithoutContext(
            'sanitizers::policySearchResponseSanitizer::error',
            {
                ...parseErrorInformation(e),
            }
        );
        throw new ApiError(
            500,
            `policySearchResponseSanitizer::error sanitizing policySearchResponse: ${
                (e as Error).message
            }`
        );
    }
};

export const lcPartyResponseSanitizer = (
    partyResponse: LifeCadParty[] = []
): LifeCadParty[] => {
    try {
        return partyResponse.map((val) => {
            return { ...val, TaxID: formatSSN(`${val.TaxID}`) };
        });
    } catch (e) {
        logErrorWithoutContext('sanitizers::lcPartyResponseSanitizer::error', {
            ...parseErrorInformation(e),
        });
        throw new ApiError(
            500,
            `lcPartyResponseSanitizer::error sanitizing lcPartyResponse: ${
                (e as Error).message
            }`
        );
    }
};

const toMaskedStringOrNull = (
    value: string | null | undefined,
    length?: number
): string | null => {
    if (isNullEmptyOrUndefined(value)) {
        return null;
    }
    if (length) {
        return new Array(length).fill('*').join('');
    }
    return `${value}`.replace(/./g, '*');
};

const fullyMaskAddress = (
    address: Address | undefined
): Address | undefined => {
    if (!address) {
        return null as unknown as undefined;
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

const fullyMaskBankDetails = (
    bankDetails: BankAccount[] | undefined
): BankAccount[] | undefined => {
    return bankDetails?.map((bankDetail) => {
        return {
            ...bankDetail,
            accountNumber: toMaskedStringOrNull(bankDetail?.accountNumber),
            accountType: null as unknown as undefined,
            branchAddress: fullyMaskAddress(bankDetail?.branchAddress),
            branchName: toMaskedStringOrNull(bankDetail?.branchName),
            branchPhoneNumber: toMaskedStringOrNull(
                bankDetail?.branchPhoneNumber
            ),
            internationalBankAccountNumber: toMaskedStringOrNull(
                bankDetail?.internationalBankAccountNumber
            ),
            nameOnAccount: toMaskedStringOrNull(bankDetail?.nameOnAccount),
            routingNumber: toMaskedStringOrNull(bankDetail?.routingNumber),
        } as BankAccount;
    });
};

const fullyMaskEmails = (emails: Email[] | undefined): Email[] | undefined => {
    return emails?.map((email) => {
        return {
            ...email,
            emailAddress: toMaskedStringOrNull(email?.emailAddress),
            emailType: null as unknown as undefined,
        } as Email;
    });
};

const fullyMaskIdentifications = (
    identifications: Identification[] | undefined
): Identification[] | undefined => {
    return identifications?.map((identification) => {
        if (identification.identificationType === IdentificationType.SSN) {
            return {
                ...identification,
                identificationValue: formatSSN(
                    identification.identificationValue?.replace(/./g, '*')
                ),
                issueState: null as unknown as undefined,
                issueCountry: null as unknown as undefined,
            };
        }
        return {
            ...identification,
            issueState: null as unknown as undefined,
            issueCountry: null as unknown as undefined,
            identificationValue:
                identification.identificationValue?.replace(/./g, '*') ||
                (null as unknown as undefined),
        };
    });
};

const fullyMaskPhones = (phones: Phone[] | undefined): Phone[] | undefined => {
    return phones?.map(
        ({
            areaCode,
            bestTime,
            countryCode,
            dialNumber,
            extension,
            phoneType,
            timezone,
            ...rest
        }) => {
            return {
                ...rest,
                ...(areaCode
                    ? { areaCode: toMaskedStringOrNull(areaCode) }
                    : {}),
                ...(bestTime
                    ? { bestTime: toMaskedStringOrNull(bestTime) }
                    : {}),
                ...(countryCode
                    ? { countryCode: toMaskedStringOrNull(countryCode) }
                    : {}),
                ...(dialNumber
                    ? { dialNumber: toMaskedStringOrNull(dialNumber) }
                    : {}),
                ...(extension
                    ? { extension: toMaskedStringOrNull(extension) }
                    : {}),
            } as Phone;
        }
    );
};

const fullyMaskTaxWithholdings = (
    taxWithholdings: TaxWithholding[] | undefined
): TaxWithholding[] | undefined => {
    return taxWithholdings;
};

const fullyMaskCoverage = (
    coverage: PolicyCoverage | undefined
): PolicyCoverage | undefined => {
    if (!coverage) {
        return null as unknown as undefined;
    }
    const maskedCoverage = coverage?.coverageLayers?.map((layer) => {
        const maskedParticipants = layer?.coverageParticipants?.map(
            (participant) => {
                return {
                    ...participant,
                    issueAge: null as unknown as undefined,
                    partyAgeAtIssue: null as unknown as undefined,
                };
            }
        );
        return { ...layer, coverageParticipants: maskedParticipants };
    });
    return { ...coverage, coverageLayers: maskedCoverage };
};

const fullyMaskPolicyParties = (
    parties: Party[] | undefined
): Party[] | undefined => {
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
            gender,
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
                abbreviatedName: toMaskedStringOrNull(abbreviatedName, 5),
                addresses: addresses?.map(fullyMaskAddress) as
                    | Address[]
                    | null as unknown as undefined,
                bankDetails: fullyMaskBankDetails(bankDetails),
                dateOfBirth: toMaskedStringOrNull(dateOfBirth),
                emails: fullyMaskEmails(emails),
                firstName: toMaskedStringOrNull(firstName, 5),
                fullName: toMaskedStringOrNull(fullName, 5),
                gender: toMaskedStringOrNull(gender, 5),
                identifications: fullyMaskIdentifications(identifications),
                lastName: toMaskedStringOrNull(lastName, 5),
                middleName: toMaskedStringOrNull(middleName, 5),
                phones: fullyMaskPhones(phones),
                taxWithholdings: fullyMaskTaxWithholdings(taxWithholdings),
            } as Party; // BPB - ToDo: Types are more specific now, so things like Gender are enums and not strings.  May need to revisit this masking strategy
        }
    );
};

export const policyMasker = (policy: Policy): Policy => {
    const { parties, coverage, ...rest } = policy;
    return {
        ...rest,
        parties: fullyMaskPolicyParties(parties),
        coverage: fullyMaskCoverage(coverage),
    };
};

export const fullyMaskPolicyResponse = (
    policyResponse: GetPolicyResponse
): GetPolicyResponse => {
    try {
        const policy = policyMasker(policyResponse.data);
        return { ...policyResponse, data: policy };
    } catch (e) {
        logErrorWithoutContext('sanitizers::fullyMaskPolicyResponse::error', {
            ...parseErrorInformation(e),
        });
        throw new ApiError(
            500,
            `fullyMaskPolicyResponse::error masking policy response: ${
                (e as Error).message
            }`
        );
    }
};

export const fullyMaskPolicySearchResponse = (
    policySearchResponse: PolicyReferenceSearchResponse
): PolicyReferenceSearchResponse => {
    try {
        const results = policySearchResponse.results.map((party) => {
            return { ...party, ssn: toMaskedStringOrNull(party.ssn) ?? '' };
        });
        return { ...policySearchResponse, results };
    } catch (e) {
        logErrorWithoutContext(
            'sanitizers::fullyMaskPolicySearchResponse::error',
            {
                ...parseErrorInformation(e),
            }
        );
        throw new ApiError(
            500,
            `fullyMaskPolicySearchResponse::error masking policySearchResponse: ${
                (e as Error).message
            }`
        );
    }
};

const fullyMaskSteps = (
    steps: StepInstance[] | undefined
): StepInstance[] | undefined => {
    return steps?.map(({ instanceInfo, ...rest }) => {
        return {
            ...rest,
            ...(instanceInfo
                ? {
                      instanceInfo: {
                          ...instanceInfo,
                          label: toMaskedStringOrNull(
                              instanceInfo?.label
                          ) as string,
                      },
                  }
                : { instanceInfo: null }),
        } as StepInstance;
    });
};

const fullyMaskCaseParties = (
    parties: PartyInstance[] | undefined
): PartyInstance[] | undefined => {
    return parties?.map(
        ({ firstName, lastName, ssn, fullName, middleName, ...rest }) => {
            return {
                firstName: toMaskedStringOrNull(firstName) as string,
                fullName: toMaskedStringOrNull(fullName) as string,
                lastName: toMaskedStringOrNull(lastName) as string,
                middleName: toMaskedStringOrNull(middleName) as string,
                ssn: toMaskedStringOrNull(ssn) as string,
                ...rest,
            };
        }
    );
};

const fullyMaskDocuments = (
    documents: DocumentInstance[] | undefined
): DocumentInstance[] | undefined => {
    return documents?.map((document) => {
        return {
            ...document,
            name: toMaskedStringOrNull(document?.name) as string,
        };
    });
};

// Fully masks PII inside of a case
// Dev Notes: AdditionalData and Events are returned as empty instead of masking, as the schemas are not fully known and have historically been places where PII leaks can occur
export const fullyMaskCase = (caseData: Case): Case => {
    const { parties, documents, additionalData, stages, events, ...rest } =
        caseData;
    return {
        ...rest,
        additionalData: {},
        documents: fullyMaskDocuments(documents) as DocumentInstance[],
        events: [],
        stages: stages.map(({ steps, ...rest }) => ({
            steps: fullyMaskSteps(steps),
            ...rest,
        })),
        parties: fullyMaskCaseParties(parties) as PartyInstance[],
    };
};

// Sanitizes case search by:
// Masking ssns in a case's party array
export const caseSearchFullMasker = ({
    data,
    ...rest
}: CaseSearchResponse): CaseSearchResponse => {
    try {
        return { data: data.map((d) => fullyMaskCase(d)), ...rest };
    } catch (e) {
        logErrorWithoutContext('Error sanitizing case search results', {
            ...parseErrorInformation(e),
        });
        throw new ApiError(
            500,
            `caseSearchFullMasker::error sanitizing case search results: ${
                (e as Error).message
            }`
        );
    }
};

export const mcsResponseSanitizer = (
    mcsResponse: AgentDataResponse
): AgentDataResponse => {
    try {
        return {
            ...mcsResponse,
            items: mcsResponse?.items?.map(agentSanitizer),
        };
    } catch (e) {
        logErrorWithoutContext('sanitizers::policyResponseSanitizer::error', {
            ...parseErrorInformation(e),
        });
        throw e;
    }
};

export const agentPartySanitizer = (
    agent: POM_Producer_Models_SearchProducersResult
) => {
    try {
        const { socialSecurityNumber } = agent;
        return {
            ...agent,
            socialSecurityNumber: formatSSN(socialSecurityNumber),
        };
    } catch (e) {
        logErrorWithoutContext('sanitizers::PomAgentParty::error', {
            ...parseErrorInformation(e),
        });
        throw e;
    }
};

export const agentSanitizer = (agent: AgentData): AgentData => {
    try {
        const { bankAccountNumber, taxId, individuals, ...rest } = agent;
        const firstAgent = individuals?.filter(
            (indvidual) => indvidual.individualTypeId === 19
        )[0];
        return {
            ...rest,
            bankAccountNumber: formatAccountNumber(
                bankAccountNumber || undefined
            ),
            taxId: formatSSN(taxId || firstAgent?.taxId || undefined),
            individuals: [
                {
                    ...firstAgent,
                    taxId: formatSSN(firstAgent.taxId || undefined),
                },
            ],
        };
    } catch (e) {
        logErrorWithoutContext('sanitizers::policySanitizers::error', {
            ...parseErrorInformation(e),
        });
        throw e;
    }
};

export const fullyMaskMcsResponse = (
    mcsResponse: AgentDataResponse
): AgentDataResponse => {
    try {
        const sanitizedItems = mcsResponse?.items?.map((agent) => {
            const {
                bankAccountNumber,
                taxId,
                individuals,
                addresses,
                phones,
                emails,
                ...rest
            } = agent;
            return {
                ...rest,
                bankAccountNumber: toMaskedStringOrNull(bankAccountNumber),
                taxId: toMaskedStringOrNull(taxId),
                individuals: individuals?.map((individual) => {
                    return Object.keys(individual).reduce((acc, key) => {
                        const typedKey = key as keyof typeof individual;
                        const val = individual[typedKey];

                        // For all string values, mask them
                        if (typeof val === 'string') {
                            // @ts-expect-error Type 'string | null' is not assignable to type 'null'.  This is a lie.
                            acc[typedKey] = toMaskedStringOrNull(
                                val as string | null
                            );
                        }
                        // For all other values (numbers, etc.), set to null
                        else {
                            acc[typedKey] = null;
                        }
                        return acc;
                    }, {} as typeof individual);
                }),
                addresses: fullyMaskAgentAddresses(addresses),
                phones: fullyMaskAgentPhones(phones) || [],
                emails: fullyMaskAgentEmails(emails) || [],
            };
        });
        return { ...mcsResponse, items: sanitizedItems };
    } catch (e) {
        logErrorWithoutContext('sanitizers::policyResponseSanitizer::error', {
            ...parseErrorInformation(e),
        });
        throw e;
    }
};

const fullyMaskAgentAddresses = (addresses: AgentAddress[]): AgentAddress[] => {
    return addresses.map((address) => {
        return {
            ...address,
            addressLine1: toMaskedStringOrNull(address?.addressLine1),
            addressLine2: toMaskedStringOrNull(address?.addressLine2),
            addressLine3: toMaskedStringOrNull(address?.addressLine3),
            addressLine4: toMaskedStringOrNull(address?.addressLine3),
            city: toMaskedStringOrNull(address?.city),
            stateCode: toMaskedStringOrNull(address?.stateCode),
            zip: toMaskedStringOrNull(address?.zip),
        };
    });
};

const fullyMaskAgentPhones = (
    phones: AgentPhone[] | undefined
): AgentPhone[] | undefined => {
    return phones?.map(
        ({ areaCode, countryCode, number, extension, ...rest }) => {
            return {
                ...rest,
                areaCode: toMaskedStringOrNull(areaCode),
                countryCode: toMaskedStringOrNull(countryCode),
                number: toMaskedStringOrNull(number),
                extension: toMaskedStringOrNull(extension),
            };
        }
    );
};

const fullyMaskAgentEmails = (
    emails: AgentEmail[] | undefined
): AgentEmail[] | undefined => {
    return emails?.map((email) => {
        return {
            ...email,
            email: toMaskedStringOrNull(email?.email),
        };
    });
};
