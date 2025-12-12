import dayjs from 'dayjs';

import { Action, EntityTypeValue } from '@deps/constants/policy';
import { isEndDated } from '@deps/helpers/date.helpers';
import { toTitleCase } from '@deps/helpers/string.helpers';
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

import {
    TaskHandler,
    ReviewPayload,
    Reason,
    AddressType,
    PartyRoleType,
    PartyRole,
    Party,
} from '../types';

const getPrefix = (prefix: string | null) => {
    switch (prefix) {
        case 'MR':
            return 'Mr.';
        case 'MRS':
            return 'Mrs.';
        case 'MS':
            return 'Ms.';
        case 'DR':
            return 'Dr.';
        default:
            return null;
    }
};

const getAddresses = (addresses: any) => {
    return addresses.length > 0
        ? addresses.map((address: any) => ({
              addressType: address?.addressType ?? AddressType.RESIDENCE,
              addressLine1: address?.addressLine1 ?? '',
              city: address?.city ?? '',
              state: address?.state?.length > 0 ? address?.state : null,
              zipCode: address?.zipCode ?? '',
              zipCodeExtension: address?.zipCodeExtension ?? '',
              country: address?.country ?? 'USA',
              endDate: address?.endDate ?? null,
              isPreferred: address?.isPreferred ?? false,
              startDate: address?.startDate ?? null,
          }))
        : [
              {
                  addressType: AddressType.RESIDENCE,
                  addressLine1: '',
                  city: '',
                  state: null,
                  zipCode: '',
              },
          ];
};

const getPhones = (phones: any) => {
    return phones.length > 0
        ? [phones[0]].map((phone: any) => ({
              phoneType: phone.phoneType ?? PhoneType.HOME,
              dialNumber: phone.dialNumber ?? null,
              areaCode: phone.areaCode ?? null,
              countryCode: phone.countryCode ?? 'USA',
              endDate: phone.endDate ?? null,
              isPreferred: phone.isPreferred ?? false,
              startDate: phone.startDate ?? null,
          }))
        : [
              {
                  phoneType: PhoneType.HOME,
                  dialNumber: '',
              },
          ];
};

const getEmails = (emails: any) => {
    return emails.length > 0
        ? emails.map((email: any) => ({
              emailAddress: email.emailAddress ?? null,
              emailType: email.emailType ?? EmailType.PERSONAL,
              endDate: email.endDate ?? null,
              isPreferred: email.isPreferred ?? false,
              startDate: email.startDate ?? null,
          }))
        : [
              {
                  emailAddress: null,
                  emailType: EmailType.PERSONAL,
              },
          ];
};

const getIdentifications = (identifications: any = []) => {
    const ssnIdentification = (identifications ?? []).find(
        (id: any) => id.identificationType === IdentificationType.SSN
    );
    return identifications.length > 0 && ssnIdentification
        ? [ssnIdentification]
        : [
              {
                  identificationValue: null,
                  identificationType: IdentificationType.SSN,
              },
          ];
};

const formatParty = (party: Party, role: string) => ({
    partyRoleId: party?.partyRoleId ?? null,
    partyRole: role,
    partyType: party?.partyType,
    prefix: party?.prefix ?? null,
    firstName:
        party?.partyType === PartyType.INDIVIDUAL
            ? party?.firstName || null
            : null,
    lastName:
        party?.partyType === PartyType.INDIVIDUAL
            ? party?.lastName || null
            : party?.fullName || null,
    middleName:
        party?.partyType === PartyType.INDIVIDUAL
            ? party?.middleName || null
            : null,
    fullName: party?.fullName || null,
    dateOfBirth: party?.dateOfBirth ?? null,
    suffix: party?.suffix ?? null,
    trustType: party?.trustType ?? null,
    addresses: getAddresses(party?.addresses ?? []),
    identifications: getIdentifications(party.identifications),
    emails: getEmails(party.emails),
    phones: getPhones(party.phones),
});

const getContractInfo = (policyResponse: any) => {
    const rolesToFormat = [
        {
            roleKey: PartyRoleType.OWNER,
            roleLabel: PartyRoleType.OWNER,
        },
        {
            roleKey: PartyRoleType.JOINTOWNER,
            roleLabel: PartyRoleType.JOINTOWNER,
        },
        {
            roleKey: PartyRoleType.THIRDPARTYDESIGNEE,
            roleLabel: PartyRoleType.THIRDPARTYDESIGNEE,
        },
    ];

    const partyRoleMap = policyResponse.partyRoles.reduce(
        (acc: Record<string, string>, role: PartyRole) => {
            acc[role.partyRole] = role.partyId;
            return acc;
        },
        {}
    );

    const parties = rolesToFormat
        .map(({ roleKey, roleLabel }) => {
            const partyId = partyRoleMap[roleKey];
            const party = policyResponse.parties.find(
                (p: Party) => p.partyId === partyId
            );
            return party ? formatParty(party, roleLabel) : null;
        })
        .filter(Boolean);

    return parties;
};
const formatPartyData = (policyResponse: any) => {
    const partyIds = policyResponse.partyRoles
        .filter(
            (role: any) =>
                role.partyRole === 'THIRDPARTYDESIGNEE' &&
                (!role?.endDate || !isEndDated(role?.endDate))
        )
        .map((role: any) => role.partyId);

    const actionData = policyResponse.parties
        .filter((party: any) => partyIds.includes(party.partyId))
        .map((party: any) => {
            return {
                action: party?.action ?? Action.NONE,
                supportingDocumentAttached:
                    party.supportingDocumentAttached ?? null,
                party: {
                    partyId: party.partyId ?? null,
                    partyType: party.partyType ?? null,
                    prefix: getPrefix(party.prefix),
                    firstName: party.firstName ?? null,
                    middleName: party.middleName ?? null,
                    lastName:
                        party.lastName ||
                        (party.partyType !== PartyType.INDIVIDUAL
                            ? party.fullName
                            : null) ||
                        null,
                    fullName: toTitleCase(
                        [
                            party.prefix,
                            party.firstName,
                            party.middleName,
                            party.lastName,
                            party.suffix,
                        ]
                            .filter(Boolean)
                            .join(' ')
                    ),
                    entityType: party.entityType ?? EntityTypeValue.Other,
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
            };
        });
    return actionData;
};

const thirdPartyDetailHandler: TaskHandler<ReviewPayload, any> = {
    api: async (payload: any, accessToken: string | undefined) => {
        const {
            category,
            businessProcess,
            carrier,
            policyNumber,
            planCode,
            logCtx,
        } = payload;
        const [nigoSearchResult, policyResult] = await Promise.all([
            NigoSearch(
                {
                    category,
                    businessProcess,
                    carrier,
                },
                accessToken,
                (logCtx ?? {}) as LoggingContext
            ),
            getPolicyDetailsSsr(
                policyNumber,
                planCode,
                accessToken,
                (logCtx ?? {}) as LoggingContext,
                true
            ),
        ]);
        return {
            nigoSearchResult,
            policyResult,
        };
    },

    getPayload: (task: any, logCtx?: LoggingContext) => ({
        category: ['Party Change', 'TPD Change'],
        businessProcess: task?.process,
        carrier: task?.carrier,
        policyNumber: task?.data?.policyNumber,
        planCode: task?.data?.planCode,
        logCtx,
    }),

    transformResponse: (response, metadata, task) => {
        if (!response || response.length === 0) return;

        const nigoResponse = response?.nigoSearchResult;
        const policyResponse = response?.policyResult;

        const reasonList: Reason[] = Array.from(
            new Set(nigoResponse.map((item: any) => item))
        );

        const seen = new Set<string>();
        const declineReasonEnum: string[] = [];
        const declineReasonOptions: {
            label: string;
            value: string;
            category: string;
            reason: string;
            detailedReason: string;
            selectOptions: any;
        }[] = [];

        for (const r of reasonList) {
            if (!seen.has(r.detailedReason)) {
                seen.add(r.detailedReason);

                const selectOptions = r.exceptionSubRefs
                    .filter(
                        (item: any) =>
                            item.carrier === task?.carrier &&
                            item.process === task?.process
                    )
                    .map((item: any) => ({
                        label: item.subNmIdDetail,
                        value: item.subNmId,
                    }));

                if (selectOptions.length) {
                    declineReasonEnum.push(r.detailedReason);
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

        metadata[0].uiSchema.declineReason = {
            'ui:options': {
                label: true,
                widget: 'CheckBoxesSelectWidget',
                enumOptions: declineReasonOptions,
            },
            'ui:dataPath': ['declineReason'],
        };

        if (task) {
            Object.assign(task, {
                data: {
                    ...task.data,

                    contractInfo: {
                        parties: getContractInfo(policyResponse),
                    },
                    effectiveDate: dayjs.utc().format(ZAHARA_API_DATE_FORMAT),
                    actionData: formatPartyData(policyResponse),
                    defaultPartyIdRoleChange:
                        formatPartyData(policyResponse)?.[0]?.party?.partyId ||
                        '',
                },
            });
        }
    },
};

export default thirdPartyDetailHandler;
