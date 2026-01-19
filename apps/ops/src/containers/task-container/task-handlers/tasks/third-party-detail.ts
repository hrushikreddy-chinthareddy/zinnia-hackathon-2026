import dayjs from 'dayjs';

import { Action, EntityTypeValue, Roles } from '@deps/constants/policy';
import { isEndDated } from '@deps/helpers/date.helpers';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { FormMetadata } from '@deps/models/case/task';
import { ManagementTask } from '@deps/models/case/task-instance';
import {
    EmailType,
    IdentificationType,
    PartyType,
    PhoneType,
} from '@deps/models/policy/sor-policy';
import { NigoSearch } from '@deps/queries/api/nigo-search';
import { getPolicyDetailsSsr } from '@deps/queries/api/policies';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import { LoggingContext } from '@deps/utils/server-logging';
import { toFullName } from '@deps/utils/tasks/role-change-data-entry.utils';

import {
    TaskHandler,
    Reason,
    ReviewPayload,
    Party,
    PolicyResponse,
    PartyRoleType,
    AddressType,
    Identification,
    Email,
    Phone,
    ApiResponse,
    Address,
    ActionDataItem,
} from '../types';

const ensureArray = <T>(value?: T[] | null): T[] =>
    Array.isArray(value) ? value : [];

const ensureSingle = <T>(items: T[], fallback: T): T[] =>
    items.length > 0 ? [items[0]] : [fallback];

const normalizeNullableString = (v?: string | null): string | null =>
    isNullEmptyOrUndefined(v) ? null : String(v);

const formatAddress = (address?: Partial<Address>): Address => ({
    addressType: address?.addressType ?? AddressType.RESIDENCE,
    addressLine1: address?.addressLine1 ?? '',
    city: address?.city ?? '',
    state:
        address?.state && String(address.state).length > 0
            ? String(address.state)
            : null,
    zipCode: address?.zipCode ?? '',
    zipCodeExtension: address?.zipCodeExtension ?? null,
    country: address?.country ?? 'USA',
    endDate: (address?.endDate as string) ?? null,
    isPreferred: Boolean(address?.isPreferred),
    startDate: (address?.startDate as string) ?? null,
});

const getAddresses = (addresses?: Party['addresses']): Address[] => {
    const arr = ensureArray(addresses);
    return arr.length > 0
        ? arr.map((a) => formatAddress(a as Partial<Address>))
        : [formatAddress()];
};

const formatPhone = (phone?: Partial<Phone>): Phone => ({
    phoneType: (phone?.phoneType as string) ?? PhoneType.MOBILE,
    dialNumber: phone?.dialNumber ?? null,
    areaCode: phone?.areaCode ?? null,
    countryCode: phone?.countryCode ?? 'USA',
    endDate: (phone?.endDate as string) ?? null,
    isPreferred: Boolean(phone?.isPreferred),
    startDate: (phone?.startDate as string) ?? null,
});

const getPhones = (phones?: Party['phones']): Phone[] => {
    const arr = ensureArray(phones);
    const mapped = arr.map((p) => formatPhone(p as Partial<Phone>));
    return ensureSingle(mapped, formatPhone());
};

const formatEmail = (email?: Partial<Email>): Email => ({
    emailAddress: email?.emailAddress ?? null,
    emailType: (email?.emailType as string) ?? EmailType.PERSONAL,
    endDate: (email?.endDate as string) ?? null,
    isPreferred: Boolean(email?.isPreferred),
    startDate: (email?.startDate as string) ?? null,
});

const getEmails = (emails?: Party['emails']): Email[] => {
    const arr = ensureArray(emails);
    return arr.length > 0
        ? arr.map((e) => formatEmail(e as Partial<Email>))
        : [formatEmail()];
};

const getIdentifications = (
    identifications?: Party['identifications']
): Identification[] => {
    const ids = ensureArray(identifications);
    const ssn = ids.find(
        (id) => id.identificationType === IdentificationType.SSN
    );
    if (ssn) {
        return [
            {
                identificationType: ssn.identificationType,
                identificationValue: ssn.identificationValue ?? null,
                endDate: ssn.endDate ?? null,
            },
        ];
    }
    return [
        {
            identificationType: IdentificationType.SSN,
            identificationValue: null,
            endDate: null,
        },
    ];
};

const formatPartyForContract = (party: Party, role: string) => {
    const isIndividual = party.partyType === PartyType.INDIVIDUAL;

    return {
        partyRoleId: party?.partyRoleId ?? null,
        partyRole: role,
        partyType: party?.partyType,
        prefix: party?.prefix ?? null,
        firstName: isIndividual
            ? normalizeNullableString(party?.firstName)
            : null,
        middleName: isIndividual
            ? normalizeNullableString(party?.middleName)
            : null,
        lastName: isIndividual
            ? normalizeNullableString(party?.lastName)
            : normalizeNullableString(party?.fullName),
        fullName: normalizeNullableString(party?.fullName) ?? toFullName(party),
        dateOfBirth: party?.dateOfBirth ?? null,
        suffix: party?.suffix ?? null,
        trustType: party?.trustType ?? null,
        addresses: getAddresses(party?.addresses),
        identifications: getIdentifications(party?.identifications),
        emails: getEmails(party?.emails),
        phones: getPhones(party?.phones),
    };
};

const getContractInfo = (policy: PolicyResponse) => {
    const rolesToFormat: PartyRoleType[] = [
        PartyRoleType.OWNER,
        PartyRoleType.JOINTOWNER,
        PartyRoleType.THIRDPARTYDESIGNEE,
    ];

    const partyRoleToId = policy.partyRoles.reduce<Record<string, string>>(
        (acc, r) => {
            acc[r.partyRole] = r.partyId;
            return acc;
        },
        {}
    );

    return rolesToFormat
        .map((role) => {
            const partyId = partyRoleToId[role];
            const party = policy.parties.find((p) => p.partyId === partyId);
            return party ? formatPartyForContract(party, role) : null;
        })
        .filter(Boolean) as ReturnType<typeof formatPartyForContract>[];
};

const formatPartyData = (policy: PolicyResponse): ActionDataItem[] => {
    const eligiblePartyIds = policy.partyRoles
        .filter(
            (r) =>
                r.partyRole === Roles.THIRDPARTYDESIGNEE &&
                (!r.endDate || !isEndDated(r.endDate))
        )
        .map((r) => r.partyId);

    return policy.parties
        .filter((p) => eligiblePartyIds.includes(p.partyId ?? ''))
        .map(
            (party): ActionDataItem => ({
                action: (party as any).action ?? Action.NONE,
                supportingDocumentAttached:
                    party.supportingDocumentAttached ?? null,
                party: {
                    partyId: party.partyId ?? null,
                    partyType: party.partyType ?? null,
                    prefix: party.prefix ?? null,
                    firstName: party.firstName ?? null,
                    middleName: party.middleName ?? null,
                    lastName:
                        party.lastName ??
                        (party.partyType !== PartyType.INDIVIDUAL
                            ? party.fullName ?? null
                            : null) ??
                        null,
                    fullName: toFullName(party),
                    entityType:
                        (party.entityType as EntityTypeValue) ??
                        EntityTypeValue.Other,
                    gender: null,
                    dateOfBirth: null,
                    trustType: party.trustType ?? null,
                    trustDate: party.trustDate ?? null,
                    preferredCommunicationType:
                        party.preferredCommunicationType ?? null,
                    addresses: getAddresses(party.addresses),
                    phones: getPhones(party.phones),
                    emails: getEmails(party.emails),
                    identifications: getIdentifications(party.identifications),
                },
            })
        );
};

const thirdPartyDetailHandler: TaskHandler<ReviewPayload, ApiResponse> = {
    api: async (payload: any, accessToken: string, logCtx: LoggingContext) => {
        const { category, businessProcess, carrier } = payload;

        const [nigoSearchResult, policyResult] = await Promise.all([
            NigoSearch(
                { category, businessProcess, carrier },
                accessToken,
                logCtx
            ),
            getPolicyDetailsSsr(
                payload.policyNumber,
                payload.planCode,
                accessToken,
                logCtx,
                true
            ),
        ]);

        return {
            nigoSearchResult: nigoSearchResult ?? [],
            policyResult: policyResult as PolicyResponse,
        };
    },

    getPayload: (task: any, logCtx?: LoggingContext) => {
        return {
            category: ['Party Change', 'TPD Change'],
            businessProcess: task?.process,
            carrier: task?.carrier,
            policyNumber: task?.data?.policyNumber,
            planCode: task?.data?.planCode,
            logCtx,
        } as ReviewPayload;
    },

    transformResponse: (
        response: ApiResponse,
        metadata: FormMetadata[],
        task?: ManagementTask
    ): void => {
        if (!response) return;

        const { nigoSearchResult, policyResult } = response;
        const nigoList: Reason[] = ensureArray(nigoSearchResult);
        const policy: PolicyResponse = policyResult;

        const seen = new Set<string>();
        const declineReasonOptions: {
            label: string;
            value: string;
            category: string;
            reason: string;
            detailedReason: string;
            selectOptions: { label: string; value: string }[];
        }[] = [];

        for (const r of nigoList) {
            if (!seen.has(r.detailedReason)) {
                seen.add(r.detailedReason);

                const selectOptions = ensureArray(r.exceptionSubRefs)
                    .filter(
                        (item: any) =>
                            item.carrier === task?.carrier &&
                            item.process === task?.process
                    )
                    .map((item: any) => ({
                        label: item.subNmIdDetail,
                        value: item.subNmId,
                    }));

                if (selectOptions.length > 0) {
                    declineReasonOptions.push({
                        label: r.detailedReason,
                        value: r.nmId,
                        category: r.category,
                        reason: r.reason,
                        detailedReason: r.detailedReason,
                        selectOptions,
                    });
                }
            }
        }

        if (metadata && metadata.length > 0) {
            metadata[0].uiSchema = metadata[0].uiSchema || {};
            (metadata[0].uiSchema as any).declineReason = {
                'ui:dataPath': ['declineReason'],
                'ui:options': {
                    label: true,
                    widget: 'CheckBoxesSelectWidget',
                    enumOptions: declineReasonOptions,
                },
            };
        }

        if (task) {
            const actionData = formatPartyData(policy);

            Object.assign(task, {
                data: {
                    ...(task.data || {}),
                    contractInfo: {
                        parties: getContractInfo(policy),
                    },
                    effectiveDate: dayjs.utc().format(ZAHARA_API_DATE_FORMAT),
                    actionData,
                    defaultPartyIdRoleChange:
                        actionData?.[0]?.party?.partyId ?? '',
                },
            });
        }
    },
};

export default thirdPartyDetailHandler;
