import { toTitleCase } from '@xd/utils/dist';
import { AxiosResponse } from 'axios';

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
const AGENT_BUSINESS_LABEL = 'PRIMARYWRITINGAGENT';
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

    // pull insured data
    const insuredParty = newBusinessObject.parties.find(
        (party) => party.partyRole === INSURED_BUSINESS_LABEL
    );
    if (insuredParty) {
        const { personalInformation: insuredPersonalInformation } =
            insuredParty;
        const {
            firstName: insuredFirstName,
            lastName: insuredLastName,
            dateOfBirth = '',
            birthSex = '',
            birthState,
        } = insuredPersonalInformation;

        const clientCaseTitle = `${insuredFirstName} ${insuredLastName} from Sureify`;

        const insuredDetails = {
            firstName: insuredFirstName,
            lastName: insuredLastName,
            sexAtBirth: toTitleCase(birthSex),
            dateOfBirth: new Date(dateOfBirth),
            // nicotineUser
            state: birthState,
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

    // pull agent data
    const agentParty = newBusinessObject.parties.find(
        (party) => party.partyRole === AGENT_BUSINESS_LABEL
    );
    if (agentParty) {
        const {
            personalInformation: agentPersonalInformation,
            email: agentEmailObject,
            identifiers,
        } = agentParty;
        const { firstName: agentFirstName, lastName: agentLastName } =
            agentPersonalInformation;
        const agentPreferedEmail = agentEmailObject.emails.find(
            (email) => agentEmailObject.preferredEmailId === email.id
        );
        const aorIdentifier = identifiers.find(
            (identifier) => identifier.key === AGENCY_ID_BUSINESS_IDENTIFIER
        );
        const npnIdentifier = identifiers.find(
            (identifier) => identifier.key === NPN_BUSINESS_IDENTIFIER
        );
        let agencyId = '';
        let npn = '';

        if (aorIdentifier) {
            agencyId = aorIdentifier.value;
        }
        if (npnIdentifier) {
            npn = npnIdentifier.value;
        }

        const agentDetails = {
            firstName: agentFirstName,
            lastName: agentLastName,
            email: agentPreferedEmail?.address,
            agencyId,
            npn,
        };
        businessClientCasePayload = {
            ...businessClientCasePayload,
            agentDetails,
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
const validateClientCasePayload = (
    payload: Partial<IllustrationsClientCase>
) => {
    if (!payload) {
        throwTypedError(
            'The data from newBusiness api has not the required values to create a client case',
            NEW_BUSINESS_API_ORIGIN
        );
    }
    if (
        !payload.eAppId ||
        !payload.insuredDetails?.firstName ||
        !payload.insuredDetails?.lastName ||
        !payload.insuredDetails?.sexAtBirth ||
        !payload.insuredDetails?.dateOfBirth ||
        !payload.insuredDetails?.state ||
        !payload.agentDetails?.npn ||
        !payload.agentDetails?.agencyId ||
        !payload.caseManagementCaseId ||
        !payload.title
    ) {
        throwTypedError(
            'The data from newBusiness api has not the required values to create a client case',
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
        const planCode = newBusinessResponseObject.policy.planCode;

        return { ...data, planCode };
    } catch (error: any) {
        throwTypedError(
            error.message,
            error.origin ?? CLIENT_CASE_MANAGER_API_ORIGIN
        );
    }
};
