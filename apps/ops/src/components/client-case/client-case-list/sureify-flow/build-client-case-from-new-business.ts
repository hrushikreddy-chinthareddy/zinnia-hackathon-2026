import { merge } from 'lodash';
import last from 'lodash/last';

import { NEW_BUSINESS_API_ORIGIN } from '@deps/queries/api/server/v2/new-business';
import { throwTypedError } from '@deps/queries/api-utils/throwTypedError';
import { IllustrationsClientCase } from '@deps/types/illustrations';
import { NewBusiness, party, Policy } from '@deps/types/new-business';
import { LoggingContext, logInfo, logTrace } from '@deps/utils/server-logging';
import { toTitleCase } from '@deps/utils/strings';

import { buildConversionData } from './conversions';
import { getAgencyIdFromHierarchy } from './get-agency-id-from-hierarchy';
import { getAgentSellingCode } from './get-agent-selling-code';
import { validateRequiredFields } from './validate-required-fields';

const INSURED_BUSINESS_LABEL = 'INSURED';
enum AgentBusinessLabel {
    PRIMARY_WRITING_AGENT = 'PRIMARYWRITINGAGENT',
    PRIMARY_SERVICING_AGENT = 'PRIMARYSERVICINGAGENT',
    ADDITIONAL_SERVICING_AGENT = 'ADDITIONALSERVICINGAGENT',
    ADDITIONAL_WRITING_AGENT = 'ADDITIONALWRITINGAGENT',
}

export const isAgentBusinessLabel = (
    value: string
): value is AgentBusinessLabel => {
    return Object.values(AgentBusinessLabel).includes(
        value as AgentBusinessLabel
    );
};

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

    // Prevent client case creation with incomplete insured data
    if (insuredPartyMissingFields.length) {
        throwTypedError(
            `There are missing insured required fields: ${insuredPartyMissingFields.join(
                ', '
            )}`,
            NEW_BUSINESS_API_ORIGIN
        );
    }

    // Convert ISO date string from New Business to a UTC Date object
    // to avoid timezone shifts during SSR and form hydration
    return {
        firstName,
        lastName,
        sexAtBirth: toTitleCase(sexAtBirth),
        dateOfBirth: new Date(`${dateOfBirth}T00:00:00.000Z`),
        state: issueState,
        // all this properties used on client case payload are not included in newBussiness
        // nicotineUser
        // illustrateAtOlderAge
        // issueAge
    };
};

export const buildAgentDetailsFromNewBusiness = async (
    parties: party[],
    loggingContext: LoggingContext
) => {
    const logPrefix = `ClientCases:New:Sureify:buildAgentDetails`;
    const logCtx = {
        ...loggingContext,
        file: 'build-client-case-from-new-business',
        function: 'buildAgentDetailsFromNewBusiness',
    };
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
        partyId,
    } = agentParty;

    logInfo(`${logPrefix} Found agent partyId`, {
        ...logCtx,
        partyId,
    });

    if (!agentEmailObject) {
        throwTypedError(
            'Agent party email is missing',
            NEW_BUSINESS_API_ORIGIN
        );
    }

    const { emails, preferredEmailId } = agentEmailObject;

    // Determine correct agent email: prefer selected email, otherwise fallback to first listed
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

    const agentSellingCode = await getAgentSellingCode(agentParty, logCtx);

    logInfo(`${logPrefix} Found selling Code for agent`, {
        ...logCtx,
        partyId,
        agentSellingCode,
    });

    return {
        firstName,
        lastName,
        email: agentEmailAddress,
        sellingCode: agentSellingCode,
    };
};

/**
 * Utility module to build a Client Case payload from a New Business object.
 *
 * Business Context:
 *  - Sureify may pass an eAppId referencing a New Business application
 *  - Our system requires a mapped Client Case record for Illustrations
 *  - This module transforms New Business domain data → Client Case domain shape
 *
 * High-Level Flow:
 *  1) Extract insured information
 *  2) Extract agent information and selling code
 *  3) Determine agency via selling hierarchy
 *  4) Validate required fields exist
 *  5) Return partial payload to initialize a Client Case
 *
 * Why this logic exists:
 *  - New Business API returns raw policy + party information
 *  - Illustrations requires normalized structure before saving
 *  - Maintains consistency between external systems & internal case data
 *
 * Error Handling Strategy:
 *  - Throws typed business errors for known missing data cases
 *  - Prevents creation of invalid client cases
 *  - Logging handled upstream via LoggingContext
 *
 * Notes:
 *  - Date strings are normalized to UTC to avoid timezone issues
 *  - Selling Code may originate from UPN/AOR identifiers OR PartyReference lookup
 *  - Required fields validated both for Insured & Agent (prevents silent failures)
 */
export const buildClientCaseFromNewBusiness = async (
    newBusinessObject: NewBusiness,
    eAppId: string,
    loggingContext: LoggingContext,
    excludeAgentUpdate = false
): Promise<Partial<IllustrationsClientCase>> => {
    const logPrefix = `ClientCases:New:Sureify`;
    const logCtx = {
        ...loggingContext,
        file: 'build-client-case-from-new-business',
        function: 'buildClientCaseFromNewBusiness',
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
    // Identify the insured party from list — New Business can contain multiple party roles
    const insuredDetails = buildInsuredDetailsFromNewbusiness(
        parties,
        newBusinessObject.policy
    );

    // Only fetch agent details and agency if not excluded (first build)
    // For subsequent updates, agent details should not change
    let agentDetails:
        | Awaited<ReturnType<typeof buildAgentDetailsFromNewBusiness>>
        | undefined;
    let agencyId: string | null | undefined;

    if (!excludeAgentUpdate) {
        agentDetails = await buildAgentDetailsFromNewBusiness(
            parties,
            loggingContext
        );

        // Once selling code is known, derive agency for routing & permissions
        // (hierarchy must exist for this agent in distribution system)
        agencyId = await getAgencyIdFromHierarchy(
            agentDetails.sellingCode,
            loggingContext
        );

        if (!agencyId) {
            return throwTypedError(
                'Agency ID was not able to be retrieved',
                NEW_BUSINESS_API_ORIGIN
            );
        }

        logTrace(`${logPrefix} Found agencyId for eApp`, {
            ...logCtx,
            agencyId,
        });
    }

    // Extract conversion data (if available)
    const conversionData = buildConversionData(newBusinessObject);

    return merge(
        {
            eAppId,
            caseManagementCaseId: caseId,
            title: 'Untitled Client Case',
            insuredDetails,
            ...(excludeAgentUpdate ? {} : { agentDetails, agencyId }),
        },
        conversionData
    );
};
