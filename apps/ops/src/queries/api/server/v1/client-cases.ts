import { toTitleCase } from '@xd/utils/dist';
import { AxiosResponse } from 'axios';
import { sortBy } from 'lodash';
import get from 'lodash/get';

import { isEmptyObject } from '@deps/helpers/objects.helpers';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { throwTypedError } from '@deps/queries/api-utils/throwTypedError';
import {
    IllustraionsClientCaseSearchResponse,
    IllustrationsClientCase,
} from '@deps/types/illustrations';
import {
    AddressObject,
    EmailObject,
    NewBusiness,
} from '@deps/types/new-business';
import { LoggingContext } from '@deps/utils/server-logging';

import { getPartyReferenceByPartyId } from './party-reference';
import { getHierarchyBySellingCode } from './producers';
import {
    getNewBusinessById,
    NEW_BUSINESS_API_ORIGIN,
} from '../v2/new-business';

const INSURED_BUSINESS_LABEL = 'INSURED';
const PRIMARY_AGENT_BUSINESS_LABEL = 'PRIMARYWRITINGAGENT';
const AOR_IDENTIFIER_LABEL = 'AOR';
const UPN_IDENTIFIER_LABEL = 'UPN';
const SELLING_CODE_IDENTIFIER_LABEL = 'SELLING_CODE';
const CLIENT_CASE_MANAGER_API_ORIGIN = 'client-case-manager-api';
const MAIN_AGENCY_ROLE = 'GeneralAgency';

const buildClientCaseFromNewBusiness = async (
    newBusinessObject: NewBusiness,
    eAppId: string,
    loggingContext: LoggingContext
) => {
    let businessClientCasePayload: Partial<IllustrationsClientCase> = {
        eAppId,
    };

    // pull Insured data
    const insuredParty = newBusinessObject.parties.find(
        (party) => party.partyRole === INSURED_BUSINESS_LABEL
    );
    if (insuredParty) {
        const {
            personalInformation: insuredPersonalInformation,
            address = {} as AddressObject,
        } = insuredParty;
        const {
            firstName: insuredFirstName,
            lastName: insuredLastName,
            dateOfBirth = '',
            gender = '',
        } = insuredPersonalInformation;

        // getting Insured address
        let insuredState = '';
        const { addresses, preferredAddressId } = address;
        if (preferredAddressId !== undefined) {
            const preferedAddress = addresses.find(
                (address) => address.id === preferredAddressId
            );
            if (preferedAddress) {
                insuredState = preferedAddress.state;
            }
        } else if (addresses.length > 0) {
            insuredState = addresses[0].state;
        }

        const clientCaseTitle = 'Untitled Client Case';

        const insuredDetails = {
            firstName: insuredFirstName,
            lastName: insuredLastName,
            sexAtBirth: toTitleCase(gender),
            dateOfBirth: new Date(dateOfBirth),
            state: insuredState,
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
            caseManagementCaseId: newBusinessObject.caseId,
            title: clientCaseTitle,
        };
    }

    // pull Agent data
    const agentParty = newBusinessObject.parties.find(
        (party) => party.partyRole === PRIMARY_AGENT_BUSINESS_LABEL
    );
    if (agentParty) {
        const {
            personalInformation: agentPersonalInformation,
            email: agentEmailObject = {} as EmailObject,
            identifiers,
            partyId,
        } = agentParty;
        const { firstName: agentFirstName, lastName: agentLastName } =
            agentPersonalInformation;

        // get agent main email
        const { emails, preferredEmailId } = agentEmailObject;
        let agentPreferedEmail = '';

        if (preferredEmailId !== undefined && emails) {
            const preferedEmail = emails.find(
                (email) => email.id === preferredEmailId
            );
            if (preferedEmail !== undefined) {
                agentPreferedEmail = preferedEmail.address;
            }
        } else if (emails && emails.length > 0) {
            agentPreferedEmail = emails[0].address;
        }

        // get Identifiers from newBusiness
        let agencyId = '';
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
            // retrieve data from partyReference and POM to get the complete data for agent and the agencyId
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
                                agentAORExternalParty.value;
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

        if (agentHierarchy) {
            // search to see if the agent is the actual main agency
            // if (agentHierarchy.role === MAIN_AGENCY_ROLE) {
            // where do i get the agencyId/hierarchyId?
            // }
            const { upline } = agentHierarchy;
            const mainAgencies = upline.filter(
                (upline) => upline.role === MAIN_AGENCY_ROLE
            );
            const sortedAgencies = sortBy(mainAgencies, 'level');
            const mainAgency = sortedAgencies[0];

            if (mainAgency) {
                // hierarchyId should be the agencyId
                const { hierarchyId } = mainAgency;
                if (!agencyId) {
                    agencyId = hierarchyId;
                }
            }
        }
        // *** Finish Producers Hierarchy Section ***

        const agentDetails = {
            firstName: agentFirstName,
            lastName: agentLastName,
            email: agentPreferedEmail,
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

const CLIENT_CASE_REQUIRED_FIELDS = {
    eAppId: 'eAppId',
    'insuredDetails.firstName': 'Insured first name',
    'insuredDetails.lastName': 'Insured last name',
    'insuredDetails.sexAtBirth': 'Insured sex at birth',
    'insuredDetails.dateOfBirth': 'Insured date of birth',
    'insuredDetails.state': 'Insured state of residence',
    'agentDetails.firstName': 'Agent first name',
    'agentDetails.lastName': 'Agent last name',
    'agentDetails.email': 'Agent email',
    agencyId: 'Agency ID',
    caseManagementCaseId: 'Case Management ID',
    title: 'Title of the case',
};

const validateClientCasePayload = (
    payload: Partial<IllustrationsClientCase>
) => {
    if (!payload) {
        throwTypedError(
            'Client case information is empty',
            NEW_BUSINESS_API_ORIGIN
        );
    }
    const missingFields: string[] = [];

    for (const [path, label] of Object.entries(CLIENT_CASE_REQUIRED_FIELDS)) {
        const value = get(payload, path);
        if (!value) {
            missingFields.push(label);
        }
    }

    if (missingFields.length > 0) {
        throwTypedError(
            `There are missing required fields: ${missingFields.join(', ')}`,
            NEW_BUSINESS_API_ORIGIN
        );
    }
};

export const createClientCaseFromNewBusiness = async (
    eAppId: string,
    token: string,
    loggingContext: LoggingContext
) => {
    const newBusinessResponseObject = await getNewBusinessById(
        eAppId,
        loggingContext
    );

    if (isEmptyObject(newBusinessResponseObject)) {
        throwTypedError('New Business not found', NEW_BUSINESS_API_ORIGIN);
    } else if (newBusinessResponseObject.message) {
        throwTypedError(
            newBusinessResponseObject.message,
            NEW_BUSINESS_API_ORIGIN
        );
    }

    const newClientCasePayload = await buildClientCaseFromNewBusiness(
        newBusinessResponseObject,
        eAppId,
        loggingContext
    );

    validateClientCasePayload(newClientCasePayload);

    const config = {
        authorization: `Bearer ${token}`,
        headers: {
            'Content-type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    };

    try {
        const { data } = await serverApi.post(
            `${apiServerBaseUrl}/client-case-manager/v1/client-case`,
            newClientCasePayload,
            config,
            loggingContext
        );

        // get plancode to preselect the product of the illustration
        const planCode = newBusinessResponseObject?.policy?.planCode ?? '';

        return { ...data, planCode };
    } catch (error: any) {
        throwTypedError(
            error.message,
            error.origin ?? CLIENT_CASE_MANAGER_API_ORIGIN
        );
    }
};
