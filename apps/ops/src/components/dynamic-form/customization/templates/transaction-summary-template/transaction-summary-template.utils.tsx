import { v4 as uuidv4 } from 'uuid';

import {
    EnterprisePhone,
    formatPhoneNumberWithCountryCode,
} from '@deps/containers/bene-change/components/beneficiary-details/phone-details/phone-details.helpers';
import { toTitleCase } from '@deps/helpers/string.helpers';
import { TaskType } from '@deps/models/case/task';
import { SorSystem } from '@deps/models/policy/enums';
import { TransactionResponse } from '@deps/queries/api/bpm';
import {
    validateBeneChangeTransaction,
    validateAgentTransaction,
} from '@deps/queries/api/web-non-financial';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';

export function getPartyMeta(item: SummaryItem) {
    const party = item.party || {};
    const address = party.addresses?.[0];
    const phone = party.phones?.[0];
    const email = party.emails?.[0];
    const identifications = party.identifications;
    return {
        party,
        fullName:
            party.fullName ||
            [party.firstName, party.middleName, party.lastName]
                .filter(Boolean)
                .join(' '),
        addressStr: formattedAddress(address),
        phoneStr: phone
            ? formatPhoneNumberWithCountryCode(phone as EnterprisePhone)
            : DEFAULT_ERROR_STRING,
        emailStr: formattedEmail(email),
        ssn: formatIdentification(identifications ?? []),
        gender: party.gender || DEFAULT_ERROR_STRING,
        dob: party.dateOfBirth || DEFAULT_ERROR_STRING,
        relationshipToParty:
            item.partyRole?.relationshipToParty || DEFAULT_ERROR_STRING,
    };
}

export function getTransactionPartyDisplayValue({
    taskType,
    fullName,
    item,
}: {
    taskType?: string;
    fullName?: string;
    item: any;
}): string {
    if (taskType === TaskType.Initiate_BeneChange_Transaction) {
        return fullName || DEFAULT_ERROR_STRING;
    } else if (taskType === TaskType.Agent_Change_Detail) {
        return FormatAgentName(item) || DEFAULT_ERROR_STRING;
    }
    return fullName || DEFAULT_ERROR_STRING;
}

export const FormatAgentName = (item: any): string => {
    const firstName = item?.party?.firstName?.trim?.() || '';
    const lastName = item?.party?.lastName?.trim?.() || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return toTitleCase(fullName) || `Ext. ID: ${item.party.agentExternalId}`;
};

const ROLE_MAP: { [key: string]: string } = {
    PRIMARYWRITINGAGENT: 'Writing agent',
    PRIMARYSERVICINGAGENT: 'Servicing agent',
};

export const formatAgentType = (item: any): string => {
    return (
        ROLE_MAP[item.partyRole] ||
        toTitleCase(item.partyRole?.replace(/_/g, ' ') || 'N/A')
    );
};

export async function fetchValidationSummary(
    validationUrl: string,
    customData: any,
    invokeNewBeneChangeApi: boolean
): Promise<TransactionResponse> {
    const requestBody = buildValidationRequestBody(customData);
    if (customData.taskType === TaskType.Initiate_BeneChange_Transaction) {
        return await validateBeneChangeTransaction(
            requestBody,
            invokeNewBeneChangeApi
        );
    } else if (customData.taskType === TaskType.Agent_Change_Detail) {
        return await validateAgentTransaction(requestBody);
    } else {
        browserLogInfo(
            '[fetchValidationSummary] Unknown taskType, no validation method called:',
            {
                taskType: customData.taskType,
            }
        );
        browserLogError(`Unsupported taskType: ${customData.taskType}`);
        throw new Error(`Unsupported taskType: ${customData.taskType}`);
    }
}

type RequestBodyBuilder = (customData: any) => any;

const requestBodyBuilders: Record<string, RequestBodyBuilder> = {
    INITIATE_BENECHANGE_TRANSACTION: (customData) => {
        const { task } = customData;
        return {
            correlationid: uuidv4(),
            carrierId: task.carrier,
            planCode: task.data?.planCode,
            policyNumber: task.data?.policyNumber,
            contractInfo: customData?.contractInfo,
            actionData: customData?.actionData,
            signatureData: customData?.signatureData,
            policyStatus: customData?.policyStatus,
            caseId: '',

            sorSystem: SorSystem.Zahara,
            sourceSystem: 'ONBASE',
            channel: 'Phone',
            documentDate: null,
            type: 'reRegProcessRequest',
            transactionType: 'Bene Change',
            isPrimaryBeneInfoOnFile: false,
            isContingentBeneInfoOnFile: false,
        };
    },
    AGENT_CHANGE_DETAIL: (customData) => {
        return {
            planCode: customData?.planCode,
            policyNumber: customData?.policyNumber,
            partyUpdates: (customData.partyUpdates || []).map((item: any) => ({
                action: item.action,
                partyRole: item.partyRole,
                party: item.party,
            })),
            signatures: customData.signatures || [
                { isSignedPresent: false, signDate: null },
            ],
        };
    },
};

export function buildValidationRequestBody(customData: any): any {
    if (!customData || typeof customData.taskType !== 'string') {
        browserLogInfo(
            '[buildValidationRequestBody] Missing or invalid taskType in customData:',
            {
                taskType: customData.taskType,
            }
        );
        return { ...customData };
    }
    if (customData.taskType === TaskType.Initiate_BeneChange_Transaction) {
        return requestBodyBuilders.INITIATE_BENECHANGE_TRANSACTION(customData);
    }
    if (customData.taskType === TaskType.Agent_Change_Detail) {
        return requestBodyBuilders.AGENT_CHANGE_DETAIL(customData);
    }
    return { ...customData };
}

export interface PartyRole {
    partyRole?: string;
    relationshipToParty?: string;
}

export interface Identification {
    identificationType: string;
    identificationValue: string;
}

export interface Address {
    addressType?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    zipCodeExtension?: string;
    country?: string;
}

export interface Phone {
    phoneType?: string;
    dialNumber?: string;
    countryCode?: string;
    areaCode?: string;
    extension?: string;
}

export interface Email {
    emailAddress?: string;
    emailType?: string;
}

export interface Party {
    partyType?: string;
    beneficiaryPercentage?: number;
    agentPercentage?: number;
    identifications?: Identification[];
    addresses?: Address[];
    phones?: Phone[];
    emails?: Email[];
    firstName?: string;
    lastName?: string;
    middleName?: string;
    gender?: string;
    dateOfBirth?: string;
    endDate?: string | null;
    entityType?: string;
    prefix?: string;
    suffix?: string;
    trustDate?: string | null;
    fullName?: string;
    [key: string]: any;
}

export interface SummaryItem {
    action?: string;
    isPerStirpes?: boolean;
    isIrrevocable?: boolean;
    preferredCommunicationType?: string;
    party?: Party;
    partyRole?: PartyRole;
    actionType?: string;
    [key: string]: any;
}

export const formatIdentification = (
    identifications: Identification[]
): string => {
    if (!Array.isArray(identifications) || identifications.length === 0)
        return '-';
    const ssn = identifications.find(
        (id: any) => id.identificationType === 'SSN'
    );
    return ssn
        ? ssn.identificationValue
        : identifications[0].identificationValue;
};

export const formattedAddress = (address?: Address): string => {
    if (!address) return '-';
    return [
        address.addressLine1,
        address.addressLine2,
        `${address.city}${address.city && address.state ? ',' : ''} ${
            address.state
        } ${address.zipCode}`,
        address.country,
    ]
        .filter(Boolean)
        .join('\n');
};

export const formattedEmail = (email?: Email): string => {
    return email?.emailAddress || '-';
};

export const getRoleLabel = (
    partyRole: PartyRole,
    t: (key: string) => string,
    taskType?: string
): string => {
    const roleLabelMap: Record<
        string,
        Record<string, string | ((t: (key: string) => string) => string)>
    > = {
        INITIATE_BENECHANGE_TRANSACTION: {
            PRIMARYBENEFICIARY: (t) => t('primaryBene'),
            CONTINGENTBENEFICIARY: (t) => t('contingentBene'),
        },
    };

    const taskRoleMap =
        (taskType && roleLabelMap[taskType]) ||
        roleLabelMap[TaskType.Initiate_BeneChange_Transaction];
    const label = partyRole?.partyRole && taskRoleMap[partyRole.partyRole];

    if (typeof label === 'function') {
        return label(t);
    } else if (typeof label === 'string') {
        return label;
    }
    return '';
};
