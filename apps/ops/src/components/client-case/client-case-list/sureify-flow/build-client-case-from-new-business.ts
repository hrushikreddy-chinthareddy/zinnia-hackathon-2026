import { toTitleCase } from '@xd/utils/dist';
import get from 'lodash/get';
import last from 'lodash/last';

import { NEW_BUSINESS_API_ORIGIN } from '@deps/queries/api/server/v2/new-business';
import { throwTypedError } from '@deps/queries/api-utils/throwTypedError';
import { IllustrationsClientCase } from '@deps/types/illustrations';
import { NewBusiness, party, Policy } from '@deps/types/new-business';
import { LoggingContext } from '@deps/utils/server-logging';

import { getAgencyIdFromHierarchy } from './get-agency-id-from-hierarchy';
import { getSellingcodeFromPartyReference } from './get-selling-code-from-party-reference';

const INSURED_BUSINESS_LABEL = 'INSURED';
enum AgentBusinessLabel {
    PRIMARY_WRITING_AGENT = 'PRIMARYWRITINGAGENT',
    PRIMARY_SERVICING_AGENT = 'PRIMARYSERVICINGAGENT',
    ADDITIONAL_SERVICING_AGENT = 'ADDITIONALSERVICINGAGENT',
    ADDITIONAL_WRITING_AGENT = 'ADDITIONALWRITINGAGENT',
}

const AOR_IDENTIFIER_LABEL = 'AOR';
const UPN_IDENTIFIER_LABEL = 'UPN';
export const CLIENT_CASE_MANAGER_API_ORIGIN = 'client-case-manager-api';

export const isAgentBusinessLabel = (
    value: string
): value is AgentBusinessLabel => {
    return Object.values(AgentBusinessLabel).includes(
        value as AgentBusinessLabel
    );
};

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

export const buildInsuredDetailsFromNewbusiness = (
    parties: party[],
    policy?: Policy
) => {
    const insuredParty = parties.find(
        (party) => party.partyRole === INSURED_BUSINESS_LABEL
    );

    if (!insuredParty) {
        return throwTypedError(
            'New business does not contain insured information',
            NEW_BUSINESS_API_ORIGIN
        );
    }
    const { personalInformation } = insuredParty;

    const issueState = policy?.issueState; // ZDR-2590

    if (!issueState) {
        throwTypedError('Issue State is missing', NEW_BUSINESS_API_ORIGIN);
    }

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

    if (insuredPartyMissingFields.length) {
        throwTypedError(
            `There are missing insured required fields: ${insuredPartyMissingFields.join(
                ', '
            )}`,
            NEW_BUSINESS_API_ORIGIN
        );
    }

    return {
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
};

export const buildAngentDetailsFromNewBusiness = async (
    parties: party[],
    loggingContext: LoggingContext
) => {
    const agentParties = parties.filter((party) =>
        isAgentBusinessLabel(party.partyRole)
    );

    const agentParty = last(agentParties);

    if (!agentParty) {
        return throwTypedError(
            'New business does not have an associated agent',
            NEW_BUSINESS_API_ORIGIN
        );
    }
    const {
        personalInformation: agentPersonalInformation,
        email: agentEmailObject,
        identifiers,
        partyId,
    } = agentParty;

    if (!agentEmailObject) {
        throwTypedError(
            'Agent party email is missing',
            NEW_BUSINESS_API_ORIGIN
        );
    }

    const { emails, preferredEmailId } = agentEmailObject;

    const agentEmail = !emails.length
        ? null
        : (preferredEmailId &&
              emails.find(({ id }) => id === preferredEmailId)) ||
          emails[0];
    const agentEmailAddress = agentEmail?.address;

    const { firstName, lastName } = agentPersonalInformation;

    const agentPartyMissingFields = validateRequiredFields(
        { firstName, lastName, email: agentEmailAddress },
        AGENT_PARTY_REQUIRED_FIELDS
    );

    if (agentPartyMissingFields.length) {
        throwTypedError(
            `There are missing agent required fields: ${agentPartyMissingFields.join(
                ', '
            )}`,
            NEW_BUSINESS_API_ORIGIN
        );
    }

    // get Identifiers from newBusiness
    let agentSellingCode: string | null = null;

    if (identifiers) {
        const aorIdentifier = identifiers.find(
            ({ key }) => key === AOR_IDENTIFIER_LABEL
        );
        const upnIdentifier = identifiers.find(
            ({ key }) => key === UPN_IDENTIFIER_LABEL
        );
        if (upnIdentifier?.value && aorIdentifier?.value) {
            // For Farmers: AOR + UPN = SELLING_CODE
            agentSellingCode = aorIdentifier.value + upnIdentifier.value;
        }
    }

    if (!agentSellingCode) {
        agentSellingCode = await getSellingcodeFromPartyReference(
            partyId,
            loggingContext
        );
    }

    if (!agentSellingCode) {
        return throwTypedError(
            'Agent Selling Code was not able to be obtained',
            NEW_BUSINESS_API_ORIGIN
        );
    }

    return {
        firstName,
        lastName,
        email: agentEmailAddress,
        sellingCode: agentSellingCode,
    };
};

export const buildClientCaseFromNewBusiness = async (
    newBusinessObject: NewBusiness,
    eAppId: string,
    loggingContext: LoggingContext
): Promise<Partial<IllustrationsClientCase>> => {
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

    const insuredDetails = buildInsuredDetailsFromNewbusiness(
        parties,
        newBusinessObject.policy
    );

    const agentDetails = await buildAngentDetailsFromNewBusiness(
        parties,
        loggingContext
    );

    const agencyId = await getAgencyIdFromHierarchy(
        agentDetails.sellingCode,
        loggingContext
    );

    if (!agencyId) {
        return throwTypedError(
            'Agency ID was not able to be retrieved',
            NEW_BUSINESS_API_ORIGIN
        );
    }

    return {
        eAppId,
        caseManagementCaseId: caseId,
        title: 'Untitled Client Case',
        insuredDetails,
        agentDetails,
        agencyId,
    };
};
