import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

import { Action, PolicyRole } from '@deps/constants/policy';
import {
    EnterprisePhone,
    formatPhoneNumberWithCountryCode,
} from '@deps/containers/bene-change/components/beneficiary-details/phone-details/phone-details.helpers';
import { REQUEST_SOURCE } from '@deps/containers/bene-change/components/steps/confirm/confirm-step.helpers';
import { getFullName } from '@deps/helpers/party-info-helpers';
import {
    isNullEmptyOrUndefined,
    toTitleCase,
} from '@deps/helpers/string.helpers';
import { TaskType } from '@deps/models/case/task';
import { SorSystem } from '@deps/models/policy/enums';
import { TransactionResponse } from '@deps/queries/api/bpm';
import { validateRoleChange } from '@deps/queries/api/role-change';
import {
    validateBeneChangeTransaction,
    validateAgentTransaction,
    validateThirdPartyDesigneeChange,
    validateAnnuitantChange,
} from '@deps/queries/api/web-non-financial';
import {
    PROCESS_WITHOUT_DOCUMENT,
    ZAHARA_API_DATE_FORMAT,
} from '@deps/types/constants';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import {
    cleanAddresses,
    cleanEmails,
    cleanPhones,
    detectRoleChangeRequestType,
    resolveRoleChangePartyId,
    toFullName,
    mergeIdentifications,
} from '@deps/utils/tasks/role-change-data-entry.utils';
import { PartyType } from '@zinnia/api-types/types/sor';

export const formatTypeLabel = (
    type: string | undefined | null,
    fallback = 'Address'
): string => (type ? toTitleCase(type.replace(/_/g, ' ')) : fallback);

export const formatSummaryValue = (
    value: string | null | undefined,
    fallback = DEFAULT_ERROR_STRING
): string => {
    if (value == null || value === '') return fallback;
    return toTitleCase(String(value).replace(/_/g, ' '));
};

export function getPartyMeta(item: SummaryItem, t: (key: string) => string) {
    const party = item.party || {};
    const identifications = party.identifications;

    return {
        party,
        fullName:
            party.fullName ||
            [party.firstName, party.middleName, party.lastName]
                .filter(Boolean)
                .join(' '),
        addressStr: formatAllAddresses(party.addresses),
        addresses: party.addresses ?? [],
        phoneStr: formatAllPhones(t, party.phones),
        phones: party.phones ?? [],
        emailStr: formatAllEmails(t, party.emails),
        emails: party.emails ?? [],
        ssn: formatIdentification(identifications ?? []),
        gender:
            formatSummaryValue(party.gender, DEFAULT_ERROR_STRING) ||
            DEFAULT_ERROR_STRING,
        dob: party.dateOfBirth || DEFAULT_ERROR_STRING,
        trustDate: party.trustDate || DEFAULT_ERROR_STRING,
        relationshipToParty:
            formatSummaryValue(
                item.relationshipToParty ??
                    (typeof item.partyRole === 'object'
                        ? item.partyRole?.relationshipToParty
                        : undefined),
                DEFAULT_ERROR_STRING
            ) || DEFAULT_ERROR_STRING,
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
    } else if (
        customData.taskType === TaskType.Initiate_AssigneeChange_Transaction
    ) {
        return await validateRoleChange(
            requestBody?.planCode,
            requestBody?.policyNumber,
            requestBody?.partyId,
            requestBody?.role,
            requestBody?.query
        );
    } else if (customData.taskType === TaskType.Third_Party_Detail) {
        return await validateThirdPartyDesigneeChange(
            requestBody?.planCode,
            requestBody?.policyNumber,
            requestBody?.partyId,
            requestBody?.requestType,
            requestBody?.query
        );
    } else if (
        customData.taskType === TaskType.Initiate_AnnuitantChange_Transaction
    ) {
        return await validateAnnuitantChange(requestBody);
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

        const isBusinessKeyMissing = customData.businessKey === undefined;
        const isCaseIdMissing = customData.caseId === undefined;

        const isSelfServe =
            customData.businessKey === PROCESS_WITHOUT_DOCUMENT ||
            (isBusinessKeyMissing && isCaseIdMissing);

        const requestSource = isSelfServe
            ? REQUEST_SOURCE.SELF_SERVE
            : REQUEST_SOURCE.DATA_ENTRY;

        const actionData = Array.isArray(customData?.actionData)
            ? customData.actionData.map((item: any) => {
                  const uiParty = item?.party;
                  return {
                      ...item,
                      party: uiParty
                          ? {
                                ...uiParty,
                                firstName: uiParty.firstName ?? null,
                                middleName: uiParty.middleName ?? null,
                                lastName:
                                    uiParty.lastName ??
                                    (uiParty.partyType !== PartyType.INDIVIDUAL
                                        ? uiParty.fullName ?? null
                                        : null),
                                fullName: toFullName(uiParty),
                                addresses: cleanAddresses(uiParty.addresses),
                                emails: cleanEmails(uiParty.emails),
                                phones: cleanPhones(uiParty.phones),
                                identifications: mergeIdentifications(
                                    uiParty.identifications
                                ),
                            }
                          : uiParty,
                  };
              })
            : customData?.actionData;
        return {
            correlationid: customData?.correlationId ?? uuidv4(),
            carrierId: task ? task.carrier : customData?.carrier,
            planCode: task ? task.data?.planCode : customData?.planCode,
            policyNumber: task
                ? task.data?.policyNumber
                : customData?.policyNumber,
            contractInfo: customData?.contractInfo,
            actionData,
            signatureData: customData?.signatureData,
            policyStatus: customData?.policyStatus,
            caseId: customData?.caseId ?? '',
            sorSystem: SorSystem.Zahara,
            sourceSystem: 'ONBASE',
            channel: 'Phone',
            documentDate: null,
            type: 'reRegProcessRequest',
            transactionType: 'Bene Change',
            isPrimaryBeneInfoOnFile: false,
            isContingentBeneInfoOnFile: false,
            requestSource: requestSource,
        };
    },
    INITIATE_ANNUITANTCHANGE_TRANSACTION: (customData) => {
        let actionData =
            customData?.actionData || customData?.task?.data?.actionData || [];

        actionData = actionData.map((item: any) => {
            const { endDate, ...partyWithoutEndDate } = item.party;
            return {
                ...item,
                party: {
                    ...partyWithoutEndDate,
                },
            };
        });

        const partyUpdates = actionData.map((item: any) => {
            const { endDate, ...partyWithoutEndDate } = item.party || {};
            return {
                action: item.action,
                partyRole: item.partyRole,
                relationshipToParty: item.relationshipToParty || null,
                party: {
                    ...partyWithoutEndDate,
                    fullName: getFullName(item.party),
                    addresses: cleanAddresses(item.party.addresses) || [],
                    emails: cleanEmails(item.party.emails) || [],
                    phones: cleanPhones(item.party.phones) || [],
                    identifications: (item.party.identifications || []).filter(
                        (id: any) =>
                            id.identificationValue != null &&
                            id.identificationValue !== ''
                    ),
                    preferredCommunicationType:
                        item.party.preferredCommunicationType === 'null'
                            ? null
                            : item.party.preferredCommunicationType,
                    usCitizen: item.party.usCitizen ?? 'Yes',
                    gender: item.party.gender ?? null,
                    dateOfBirth: item.party.dateOfBirth ?? null,
                    countryOfCitizenship:
                        item.party.countryOfCitizenship ?? 'US',
                    startDate:
                        item.action === Action.ADD ||
                        item.action === Action.UPDATE
                            ? dayjs().format(ZAHARA_API_DATE_FORMAT)
                            : null,
                },
            };
        });

        return {
            effectiveDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
            correlationid: customData.correlationId ?? uuidv4(),
            carrierId: customData?.carrier,
            planCode: customData?.planCode,
            policyNumber: customData?.policyNumber,
            signatures: customData?.signatureData?.signatures || [],
            supportingDocumentAttached: customData?.supportingDocumentAttached,
            partyUpdates,
            actionData,
        };
    },
    INITIATE_ASSIGNEECHANGE_TRANSACTION: (customData) => {
        const { actionData } = customData || [];
        const { requestType, addedItem, deletedItem } =
            detectRoleChangeRequestType(actionData);

        const partyId = resolveRoleChangePartyId(
            requestType,
            deletedItem,
            customData.defaultPartyIdRoleChange
        );

        const uiParty = (addedItem ?? deletedItem)?.party ?? null;

        const cleanedParty = uiParty
            ? {
                  ...uiParty,
                  fullName: getFullName(uiParty),
                  entityType:
                      uiParty.partyType === PartyType.ORGANIZATION &&
                      !uiParty.entityType
                          ? 'UNKNOWN'
                          : uiParty.entityType,
                  addresses: cleanAddresses(uiParty.addresses),
                  emails: cleanEmails(uiParty.emails),
                  phones: cleanPhones(uiParty.phones),
                  preferredCommunicationType:
                      uiParty.preferredCommunicationType === 'null'
                          ? null
                          : uiParty.preferredCommunicationType,
                  startDate:
                      requestType === Action.ADD ||
                      requestType === Action.UPDATE
                          ? dayjs().format(ZAHARA_API_DATE_FORMAT)
                          : null,
                  endDate:
                      requestType === Action.DELETE
                          ? dayjs().format(ZAHARA_API_DATE_FORMAT)
                          : null,
                  collateralAmount: isNullEmptyOrUndefined(
                      uiParty.collateralAmount
                  )
                      ? null
                      : Number(uiParty.collateralAmount),
              }
            : null;
        return {
            planCode: customData?.planCode,
            policyNumber: customData?.policyNumber,
            partyId,
            role: PolicyRole.ASSIGNEE,
            query: {
                requestType,
                effectiveDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
                caseId: customData?.caseId,
                correlationId: customData?.correlationId,
                changeReason: customData?.changeReason,
                partyRole: PolicyRole.ASSIGNEE,
                signatures: customData?.signatureData?.signatures,
                notarySignatures: customData?.signatureData?.notarySignatures,
                documents: customData?.documents,
                supportingDocumentAttached:
                    customData?.supportingDocumentAttached || null,
                relationshipToTheCurrentOwner:
                    customData?.relationshipToTheCurrentOwner,
                party: cleanedParty,
                partyId,
            },
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
    THIRD_PARTY_DETAIL: (customData) => {
        const { actionData } = customData || [];
        const { requestType, addedItem, deletedItem } =
            detectRoleChangeRequestType(actionData);

        const partyId = resolveRoleChangePartyId(
            requestType,
            deletedItem,
            customData.defaultPartyIdRoleChange
        );

        const uiParty = (addedItem ?? deletedItem)?.party ?? null;

        const cleanedParty = uiParty
            ? {
                  ...uiParty,
                  addresses: cleanAddresses(uiParty.addresses),
                  emails: cleanEmails(uiParty.emails),
                  phones: cleanPhones(uiParty.phones),
                  firstName: uiParty.firstName ?? null,
                  middleName: uiParty.middleName ?? null,
                  lastName:
                      uiParty.lastName ??
                      (uiParty.partyType !== PartyType.INDIVIDUAL
                          ? uiParty.fullName ?? null
                          : null),
                  fullName: toFullName(uiParty),
                  entityType:
                      uiParty.partyType === PartyType.ORGANIZATION &&
                      !uiParty.entityType
                          ? 'UNKNOWN'
                          : uiParty.entityType,
              }
            : null;
        return {
            planCode: customData?.planCode,
            policyNumber: customData?.policyNumber,
            partyId,
            role: PolicyRole.THIRDPARTYDESIGNEE,
            requestType,
            query: {
                effectiveDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
                caseId: customData?.caseId,
                correlationId: customData?.correlationId,
                changeReason: customData?.changeReason,
                signatures: customData?.signatureData?.signatures,
                beneDetailsReqInd: customData?.beneDetailsReqInd || false,
                documents: uiParty?.documents,
                supportingDocumentAttached:
                    uiParty?.supportingDocumentAttached || null,
                relationshipToParty: customData?.relationshipToParty,
                party: cleanedParty,
            },
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
    if (customData.taskType === TaskType.Third_Party_Detail) {
        return requestBodyBuilders.THIRD_PARTY_DETAIL(customData);
    }
    if (customData.taskType === TaskType.Initiate_AssigneeChange_Transaction) {
        return requestBodyBuilders.INITIATE_ASSIGNEECHANGE_TRANSACTION(
            customData
        );
    }
    if (customData.taskType === TaskType.Initiate_AnnuitantChange_Transaction) {
        return requestBodyBuilders.INITIATE_ANNUITANTCHANGE_TRANSACTION(
            customData
        );
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

    const clean = (v: any) =>
        v === null || v === undefined ? '' : String(v).trim();

    const line1 = clean(address.addressLine1);
    const line2 = clean(address.addressLine2);
    const city = clean(address.city);
    const state = clean(address.state);
    const zip = clean(address.zipCode);
    const country = clean(address.country);

    const cityStateZip = [city, state && `${state}`, zip]
        .filter((v) => v && v.length > 0)
        .join(', ');

    return [line1, line2, cityStateZip, country]
        .filter((v) => v && v.length > 0)
        .join('\n');
};

export const formattedEmail = (email?: Email): string => {
    return email?.emailAddress || '-';
};

export const formattedPhone = (phone?: Phone): string => {
    if (!phone) return '-';
    return formatPhoneNumberWithCountryCode(phone as EnterprisePhone);
};

export const formatAllAddresses = (addresses?: Address[]): string => {
    if (!addresses || addresses.length === 0) return '-';

    return addresses
        .map((addr) => {
            const typeLabel = addr.addressType
                ? toTitleCase(addr.addressType.replace(/_/g, ' '))
                : 'Address';
            const formattedAddr = formattedAddress(addr);
            return `${typeLabel}\n${formattedAddr}`;
        })
        .join('\n\n');
};

export const formatAllPhones = (
    t: (key: string) => string,
    phones?: Phone[]
): string => {
    if (!phones || phones.length === 0) return DEFAULT_ERROR_STRING;

    return phones
        .map((phone) => {
            const typeLabel = phone.phoneType
                ? toTitleCase(phone.phoneType.replace(/_/g, ' '))
                : t('allFields.phone');
            const formattedPhone = formatPhoneNumberWithCountryCode(
                phone as EnterprisePhone
            );
            return `${typeLabel}\n${formattedPhone}`;
        })
        .join('\n\n');
};

export const formatAllEmails = (
    t: (key: string) => string,
    emails?: Email[]
): string => {
    if (!emails || emails.length === 0) return DEFAULT_ERROR_STRING;

    return emails
        .map((email) => {
            const typeLabel = email.emailType
                ? toTitleCase(email.emailType.replace(/_/g, ' '))
                : t('allFields.email');
            return `${typeLabel}\n${email.emailAddress || '-'}`;
        })
        .join('\n\n');
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
            OWNER: (t) => t('owner'),
            JOINTOWNER: (t) => t('jointOwner'),
            INSURED: (t) => t('insured'),
            ANNUITANT: (t) => t('annuitant'),
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

export type SummaryItemWithRoles = SummaryItem & { roles: string[] };

export const groupPartiesByPartyId = (
    items: SummaryItem[],
    t: (key: string) => string,
    taskType?: string
): SummaryItemWithRoles[] => {
    const grouped = items.reduce<Record<string, SummaryItemWithRoles>>(
        (acc, item) => {
            const partyId =
                item.party?.partyId ?? (item.partyRole as any)?.partyId;
            const key = partyId || `idx-${Object.keys(acc).length}`;

            if (!acc[key]) {
                acc[key] = { ...item, roles: [] };
            }

            const role = item.partyRole
                ? getRoleLabel(item.partyRole, t, taskType)
                : '';
            if (role && !acc[key].roles.includes(role)) {
                acc[key].roles.push(role);
            }

            return acc;
        },
        {}
    );

    return Object.values(grouped);
};
