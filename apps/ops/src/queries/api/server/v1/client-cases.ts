import { toTitleCase } from '@xd/utils/dist';
import { AxiosResponse } from 'axios';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { throwTypedError } from '@deps/queries/api-utils/throwTypedError';
import {
    IllustraionsClientCaseSearchResponse,
    IllustrationsClientCase,
} from '@deps/types/illustrations';
import { NewBusiness } from '@deps/types/new-business';
import { LoggingContext } from '@deps/utils/server-logging';

import { getPartyReferenceByPartyId } from './party-reference';
import { getHierarchyBySellingCode } from './producers';
import { NEW_BUSINESS_API_ORIGIN } from '../v2/new-business';

const INSURED_BUSINESS_LABEL = 'INSURED';
enum AgentBusinessLabel {
    PRIMARY_WRITING_AGENT = 'PRIMARYWRITINGAGENT',
    PRIMARY_SERVICING_AGENT = 'PRIMARYSERVICINGAGENT',
    ADDITIONAL_SERVICING_AGENT = 'ADDITIONALSERVICINGAGENT',
    ADDITIONAL_WRITING_AGENT = 'ADDITIONALWRITINGAGENT',
}

const AOR_IDENTIFIER_LABEL = 'AOR';
const UPN_IDENTIFIER_LABEL = 'UPN';
const SELLING_CODE_IDENTIFIER_LABEL = 'SELLING_CODE';
const CLIENT_CASE_MANAGER_API_ORIGIN = 'client-case-manager-api';
const MAIN_AGENCY_ROLE = 'GeneralAgency';

function isAgentBusinessLabel(value: string): value is AgentBusinessLabel {
    return Object.values(AgentBusinessLabel).includes(
        value as AgentBusinessLabel
    );
}

/**
 * Returns an array with the readable names of missing fields of an object
 */
const validateRequiredFields = (
    object: any,
    requiredFieldsPathArray: Record<string, string>
) =>
    Object.entries(requiredFieldsPathArray)
        .filter(([path]) => {
            const value = get(object, path);
            return value === null || value === undefined || value === '';
        })
        .map(([_, label]) => label);

const INSURED_PARTY_REQUIRED_FIELDS = {
    firstName: 'Insured first name',
    lastName: 'Insured last name',
    dateOfBirth: 'Insured date of birth',
    state: 'Insured state of residence',
};

const AGENT_PARTY_REQUIRED_FIELDS = {
    firstName: 'Agent first name',
    lastName: 'Agent last name',
    email: 'Agent email',
};

export const buildClientCaseFromNewBusiness = async (
    newBusinessObject: NewBusiness,
    eAppId: string,
    loggingContext: LoggingContext
) => {
    let businessClientCasePayload: Partial<IllustrationsClientCase> = {
        eAppId,
    };

    const { parties, caseId } = newBusinessObject;
    if (!parties) {
        throwTypedError(
            'New Bussiness parties property is missing',
            NEW_BUSINESS_API_ORIGIN
        );
    }

    if (!caseId) {
        throwTypedError(
            'New Bussiness caseId is missing',
            NEW_BUSINESS_API_ORIGIN
        );
    }

    // pull Insured data
    const insuredParty = parties.find(
        (party) => party.partyRole === INSURED_BUSINESS_LABEL
    );
    if (!insuredParty) {
        throwTypedError(
            'New business does not contain insured information',
            NEW_BUSINESS_API_ORIGIN
        );
    } else {
        const { personalInformation } = insuredParty;

        const issueState = newBusinessObject?.policy?.issueState; // ZDR-2590

        if (!issueState) {
            throwTypedError('Issue State is missing', NEW_BUSINESS_API_ORIGIN);
        }
        const clientCaseTitle = 'Untitled Client Case';

        const {
            firstName,
            lastName,
            dateOfBirth,
            birthSex: sexAtBirth,
        } = personalInformation;

        const insuredPartyMissingFields = validateRequiredFields(
            {
                firstName,
                lastName,
                dateOfBirth,
                state: issueState,
            },
            INSURED_PARTY_REQUIRED_FIELDS
        );

        if (insuredPartyMissingFields.length > 0) {
            throwTypedError(
                `There are missing insured required fields: ${insuredPartyMissingFields.join(
                    ', '
                )}`,
                NEW_BUSINESS_API_ORIGIN
            );
        }

        const insuredDetails = {
            firstName,
            lastName,
            sexAtBirth: toTitleCase(sexAtBirth),
            dateOfBirth: new Date(dateOfBirth),
            state: issueState,
            // all this properties used on client case payload are not included in newBussiness
            // nicotineUser
            // illustrateAtOlderAge
            // issueAge
            // riskClass
            // riskClassCode
        };

        businessClientCasePayload = {
            ...businessClientCasePayload,
            insuredDetails,
            caseManagementCaseId: caseId,
            title: clientCaseTitle,
        };
    }

    // pull Agent data
    const agentParties = parties.filter((party) =>
        isAgentBusinessLabel(party.partyRole)
    );

    const agentParty =
        agentParties.length > 0 ? agentParties.at(-1) : undefined;

    if (!agentParty) {
        throwTypedError(
            'New business does not have an associated agent',
            NEW_BUSINESS_API_ORIGIN
        );
    } else {
        const {
            personalInformation: agentPersonalInformation,
            email: agentEmailObject,
            identifiers,
            partyId,
        } = agentParty;
        const { firstName, lastName } = agentPersonalInformation;

        if (!agentEmailObject) {
            throwTypedError(
                'Agent party email is missing',
                NEW_BUSINESS_API_ORIGIN
            );
        }

        // get agent main email
        const { emails, preferredEmailId } = agentEmailObject;
        let email = '';

        if (preferredEmailId !== undefined && emails) {
            const preferedEmail = emails.find(
                (email) => email.id === preferredEmailId
            );
            if (preferedEmail !== undefined) {
                email = preferedEmail.address;
            }
        } else if (emails && emails.length > 0) {
            email = emails[0].address;
        }

        const agentPartyMissingFields = validateRequiredFields(
            { firstName, lastName, email },
            AGENT_PARTY_REQUIRED_FIELDS
        );

        if (agentPartyMissingFields.length > 0) {
            throwTypedError(
                `There are missing agent required fields: ${agentPartyMissingFields.join(
                    ', '
                )}`,
                NEW_BUSINESS_API_ORIGIN
            );
        }

        // get Identifiers from newBusiness
        let agentSellingCode = '';

        if (identifiers) {
            const aorIdentifier = identifiers.find(
                (identifier) => identifier?.key === AOR_IDENTIFIER_LABEL
            );
            const upnIdentifier = identifiers.find(
                (identifier) => identifier?.key === UPN_IDENTIFIER_LABEL
            );
            if (
                upnIdentifier &&
                upnIdentifier.value &&
                aorIdentifier &&
                aorIdentifier.value
            ) {
                agentSellingCode = aorIdentifier.value + upnIdentifier.value;
            }
        }

        if (!agentSellingCode) {
            // *** Init Party Reference Section ***
            // call api reference to get all the information
            const partyReferenceResponse = await getPartyReferenceByPartyId(
                partyId,
                loggingContext
            );

            if (partyReferenceResponse) {
                const { email, alias } = partyReferenceResponse;
                const agentAlias = alias.find((alias) => alias.email === email);
                if (agentAlias) {
                    const { externalPartyIds } = agentAlias;

                    if (externalPartyIds) {
                        const agentSellingCodeExternalParty =
                            externalPartyIds.find(
                                (externalParty) =>
                                    externalParty.key ===
                                    SELLING_CODE_IDENTIFIER_LABEL
                            );

                        // AOR + UPN = SELLING_CODE
                        const agentAORExternalParty = externalPartyIds.find(
                            (externalParty) =>
                                externalParty.key === AOR_IDENTIFIER_LABEL
                        );

                        const agentUPNExternalParty = externalPartyIds.find(
                            (externalParty) =>
                                externalParty.key === UPN_IDENTIFIER_LABEL
                        );

                        if (agentSellingCodeExternalParty) {
                            agentSellingCode =
                                agentSellingCodeExternalParty.value;
                        } else if (
                            agentAORExternalParty &&
                            agentUPNExternalParty
                        ) {
                            agentSellingCode =
                                agentAORExternalParty.value +
                                agentUPNExternalParty.value;
                        }
                    }
                }
            }
            // *** Finish Party Reference Section ***
        }

        if (!agentSellingCode) {
            throwTypedError(
                'Agent Selling Code was not able to be obtained',
                NEW_BUSINESS_API_ORIGIN
            );
        }

        // *** Init Producers Hierarchy Section ***
        const agentHierarchy = await getHierarchyBySellingCode(
            agentSellingCode,
            loggingContext
        );

        const { role, upline, sellingCode } = agentHierarchy ?? {};
        let agencyId = '';

        if (role === MAIN_AGENCY_ROLE && sellingCode) {
            agencyId = sellingCode;
        } else if (upline) {
            const mainAgencies = upline.filter(
                (upline) => upline.role === MAIN_AGENCY_ROLE
            );
            const sortedAgencies = sortBy(mainAgencies, 'level');
            const mainAgency = sortedAgencies[0];

            if (mainAgency) {
                // get the sellingCode of the maing agency to get the agencyId
                const { sellingCode } = mainAgency;
                agencyId = sellingCode;
            }
        }
        // *** Finish Producers Hierarchy Section ***

        if (!agencyId) {
            throwTypedError(
                'Agency ID was not able to be retrieved',
                NEW_BUSINESS_API_ORIGIN
            );
        }

        const agentDetails = {
            firstName,
            lastName,
            email,
            sellingCode: agentSellingCode,
        };

        businessClientCasePayload = {
            ...businessClientCasePayload,
            agentDetails,
            agencyId,
        };
    }

    return businessClientCasePayload;
};

export const searchClientCaseByEappId = async (
    eAppId: string,
    token: string,
    loggingContext: LoggingContext
) => {
    try {
        const config = {
            authorization: `Bearer ${token}`,
            headers: {
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        };

        const searchUrl = `${apiServerBaseUrl}/client-case-manager/v1/client-case/search?eAppId=${eAppId}`;
        const { data: searchResponse } = await serverApi.get<
            any,
            AxiosResponse<IllustraionsClientCaseSearchResponse>
        >(searchUrl, config, loggingContext);

        return searchResponse.results || [];
    } catch (error: any) {
        throwTypedError(error.message, CLIENT_CASE_MANAGER_API_ORIGIN);
    }
};

export const createClientCase = async (
    clientCaseData: Partial<IllustrationsClientCase>,
    token: string,
    loggingContext: LoggingContext
) => {
    try {
        const { data } = await serverApi.post(
            `${apiServerBaseUrl}/client-case-manager/v1/client-case`,
            clientCaseData,
            {
                authorization: `Bearer ${token}`,
                headers: {
                    'Content-type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            },
            loggingContext
        );

        return data;
    } catch (error: any) {
        throwTypedError(error.message, CLIENT_CASE_MANAGER_API_ORIGIN);
    }
};
