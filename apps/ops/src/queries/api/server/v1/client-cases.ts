import { toTitleCase } from '@xd/utils/dist';
import { AxiosResponse } from 'axios';
import get from 'lodash/get';

import { isEmptyObject } from '@deps/helpers/objects.helpers';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { throwTypedError } from '@deps/queries/api-utils/throwTypedError';
import {
    IllustraionsClientCaseSearchResponse,
    IllustrationsClientCase,
} from '@deps/types/illustrations';
import { NewBusiness } from '@deps/types/new-business';
import { LoggingContext } from '@deps/utils/server-logging';

import {
    getNewBusinessById,
    NEW_BUSINESS_API_ORIGIN,
} from '../v2/new-business';

const INSURED_BUSINESS_LABEL = 'INSURED';
const PRIMARY_AGENT_BUSINESS_LABEL = 'PRIMARYWRITINGAGENT';
const AGENCY_ID_BUSINESS_IDENTIFIER = 'AOR';
const NPN_BUSINESS_IDENTIFIER = 'UPN';
const CLIENT_CASE_MANAGER_API_ORIGIN = 'client-case-manager-api';

const buildClientCaseFromNewBusiness = (
    newBusinessObject: NewBusiness,
    eAppId: string
) => {
    let businessClientCasePayload: Partial<IllustrationsClientCase> = {
        eAppId,
    };

    // pull Insured data
    const insuredParty = newBusinessObject.parties.find(
        (party) => party.partyRole === INSURED_BUSINESS_LABEL
    );
    if (insuredParty) {
        const { personalInformation: insuredPersonalInformation, address } =
            insuredParty;
        const {
            firstName: insuredFirstName,
            lastName: insuredLastName,
            dateOfBirth = '',
            gender = '',
        } = insuredPersonalInformation;

        // getting Insured address
        let insuredState;
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
        } else {
            insuredState = '';
        }

        const clientCaseTitle = `${insuredFirstName} ${insuredLastName} from Sureify`;

        const insuredDetails = {
            firstName: insuredFirstName,
            lastName: insuredLastName,
            sexAtBirth: toTitleCase(gender),
            dateOfBirth: new Date(dateOfBirth),
            state: insuredState,
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
            email: agentEmailObject,
            identifiers,
        } = agentParty;
        const { firstName: agentFirstName, lastName: agentLastName } =
            agentPersonalInformation;

        // get agent main email
        let agentPreferedEmail = '';
        if (agentEmailObject && agentEmailObject.emails) {
            const foundAgentEmail = agentEmailObject.emails.find(
                (email) => agentEmailObject.preferredEmailId === email.id
            );
            if (foundAgentEmail) {
                agentPreferedEmail = foundAgentEmail.address;
            }
        }

        // get Identifiers
        let agencyId = '';
        let npn = '';

        if (identifiers) {
            const aorIdentifier = identifiers.find(
                (identifier) =>
                    identifier?.key === AGENCY_ID_BUSINESS_IDENTIFIER
            );
            const npnIdentifier = identifiers.find(
                (identifier) => identifier?.key === NPN_BUSINESS_IDENTIFIER
            );
            if (aorIdentifier && aorIdentifier.value) {
                agencyId = aorIdentifier.value;
            }
            if (npnIdentifier && npnIdentifier.value) {
                npn = npnIdentifier.value;
            }
        }

        const agentDetails = {
            firstName: agentFirstName,
            lastName: agentLastName,
            email: agentPreferedEmail,
            npn,
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

    const newClientCasePayload = buildClientCaseFromNewBusiness(
        newBusinessResponseObject,
        eAppId
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
