import { Action, EntityTypeValue } from '@deps/constants/policy';
import { ExtendedAddress } from '@deps/contexts/RoleChangeContext';
import { isEndDated } from '@deps/helpers/date.helpers';
import { toTitleCase } from '@deps/helpers/string.helpers';
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
import { LoggingContext } from '@deps/utils/server-logging';

import {
    TaskHandler,
    Reason,
    BeneficiaryTaskPayload,
    AddressType,
    PartyRoleType,
    PartyRole,
    Party,
    PolicyResponse,
    ApiResponse,
} from '../types';

type Identification = {
    identificationId?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    identificationType?: string | null;
    identificationKey?: string | null;
    identificationValue?: string | null;
    identificationDescription?: string | null;
    issueState?: string | null;
    issueCountry?: string | null;
};

const ensureArray = <T>(value?: T[] | null): T[] =>
    Array.isArray(value) ? value : [];

const getIdentifications = (identifications: Identification[] = []) => {
    const ssnIdentification = (identifications ?? []).find(
        (id: Identification) => id.identificationType === IdentificationType.SSN
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

const normalizePrefix = (prefix: string | null) => {
    if (!prefix) return null;
    switch (prefix.toUpperCase()) {
        case 'MR':
        case 'MR.':
            return 'MR';
        case 'MRS':
        case 'MRS.':
            return 'MRS';
        case 'MS':
        case 'MS.':
            return 'MS';
        case 'DR':
        case 'DR.':
            return 'DR';
        default:
            return null;
    }
};
export const formatParties = (policyResponse: PolicyResponse) => {
    const partyRoleMap = policyResponse.partyRoles.reduce(
        (acc: Record<string, string>, role: PartyRole) => {
            acc[role.partyRole] = role.partyId;
            return acc;
        },
        {}
    );

    const formatAddress = (
        address: ExtendedAddress = {},
        type: AddressType
    ) => ({
        addressType:
            type === AddressType.RESIDENCE
                ? AddressType.RESIDENCE
                : AddressType.MAILING,
        addressLine1: address.addressLine1 ?? null,
        addressLine2: null,
        addressLine3: null,
        city: address?.city ?? null,
        state: address?.state ?? null,
        zipCode: address?.zipCode ?? null,
        zipCodeExtension: address?.zipCodeExtension ?? null,
        country: address.country ?? 'US',
        endDate: address.endDate ?? null,
        startDate: address.startDate ?? null,
    });

    const getAddresses = (addresses: ExtendedAddress[] = []) => {
        const findByType = (type: AddressType) =>
            addresses.find(
                (a: ExtendedAddress) =>
                    a.addressType?.toUpperCase?.() === type.toUpperCase()
            );
        return [
            formatAddress(
                findByType(AddressType.RESIDENCE),
                AddressType.RESIDENCE
            ),
            formatAddress(findByType(AddressType.MAILING), AddressType.MAILING),
        ];
    };

    const formatParty = (party: Party, role: string) => ({
        partyRoleId: party?.partyRoleId ?? null,
        partyRole: role,
        partyType: party?.partyType,
        prefix: normalizePrefix(party?.prefix ?? null),
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
        emails:
            party.emails.length > 0
                ? party.emails.map((email: any) => ({
                      emailAddress: email.emailAddress ?? null,
                      emailType: email.emailType ?? EmailType.PERSONAL,
                  }))
                : [
                      {
                          emailAddress: null,
                          emailType: EmailType.PERSONAL,
                      },
                  ],
        phones:
            party.phones.length > 0
                ? [party.phones[0]].map((phone: any) => ({
                      areaCode: phone?.areaCode ?? null,
                      bestTime: phone?.bestTime ?? null,
                      countryCode: phone?.countryCode ?? 'US',
                      dialNumber: phone?.dialNumber ?? null,
                      endDate: phone?.endDate ?? null,
                      extension: phone?.extension ?? null,
                      isPreferred: phone?.isPreferred ?? false,
                      phoneId: phone?.phoneId ?? null,
                      phoneType: phone?.phoneType ?? PhoneType.MOBILE,
                      startDate: phone?.startDate ?? null,
                      timezone: phone?.timezone ?? null,
                  }))
                : [
                      {
                          areaCode: null,
                          bestTime: null,
                          countryCode: 'US',
                          dialNumber: null,
                          endDate: null,
                          extension: null,
                          isPreferred: false,
                          phoneId: null,
                          phoneType: PhoneType.MOBILE,
                          startDate: null,
                          timezone: null,
                      },
                  ],
    });

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
            roleKey: PartyRoleType.ANNUITANT,
            roleLabel: PartyRoleType.ANNUITANT,
        },
        {
            roleKey: PartyRoleType.JOINTANNUITANT,
            roleLabel: PartyRoleType.JOINTANNUITANT,
        },
    ];

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

export const formatAnnuitants = (policyResponse: PolicyResponse) => {
    const getAnnuitantsByRole = (roleType: string) => {
        const partyIds = policyResponse.partyRoles
            .filter(
                (role: PartyRole) =>
                    role.partyRole === roleType &&
                    (!role?.endDate || !isEndDated(role?.endDate))
            )
            .map((role: PartyRole) => role.partyId);

        const annuitantData = policyResponse.parties
            .filter((party: any) => partyIds.includes(party.partyId))
            .map((annuitant: any) => {
                return {
                    action: annuitant.action ?? Action.NONE,
                    partyRole: roleType,
                    relationshipToParty:
                        (annuitant?.partyId &&
                            policyResponse.partyRoles?.find(
                                (role) => role?.partyId === annuitant?.partyId
                            )?.relationshipToParty) ||
                        'SELF',
                    party: {
                        partyId: annuitant.partyId ?? null,
                        partyType: annuitant.partyType,
                        prefix: annuitant.prefix ?? null,
                        firstName: annuitant.firstName ?? null,
                        middleName: annuitant.middleName ?? null,
                        lastName:
                            annuitant.lastName ||
                            (annuitant.partyType !== PartyType.INDIVIDUAL
                                ? annuitant.fullName
                                : null) ||
                            null,
                        suffix: annuitant.suffix ?? null,
                        trustType: annuitant.trustType ?? null,
                        trustDate: annuitant.trustDate ?? null,
                        entityType:
                            annuitant.entityType ?? EntityTypeValue.Other,
                        gender: annuitant.gender ?? null,
                        usCitizen: annuitant.usCitizen ?? null,
                        countryOfCitizenship:
                            annuitant.countryOfCitizenship ?? null,
                        dateOfBirth: annuitant.dateOfBirth ?? null,
                        documents: annuitant.documents ?? [],
                        preferredCommunicationType:
                            annuitant.preferredCommunicationType ?? 'EMAIL',
                        fullName: toTitleCase(
                            [
                                annuitant.prefix,
                                annuitant.firstName,
                                annuitant.middleName,
                                annuitant.lastName,
                                annuitant.suffix,
                            ]
                                .filter(Boolean)
                                .join(' ')
                        ),
                        emails:
                            annuitant.emails.length > 0
                                ? annuitant.emails.map((email: any) => ({
                                      emailAddress: email.emailAddress ?? null,
                                      emailId: email.emailId ?? null,
                                      emailType:
                                          email.emailType ?? EmailType.PERSONAL,
                                      endDate: email.endDate ?? null,
                                      isPreferred: email.isPreferred ?? false,
                                      startDate: email.startDate ?? null,
                                  }))
                                : [
                                      {
                                          emailAddress: null,
                                          emailId: null,
                                          emailType: EmailType.PERSONAL,
                                          endDate: null,
                                          isPreferred: false,
                                          startDate: null,
                                      },
                                  ],
                        phones:
                            annuitant.phones.length > 0
                                ? [annuitant.phones[0]].map((phone: any) => ({
                                      areaCode: phone.areaCode ?? null,
                                      bestTime: phone.bestTime ?? null,
                                      countryCode: phone.countryCode ?? 'US',
                                      dialNumber: phone.dialNumber ?? null,
                                      endDate: phone.endDate ?? null,
                                      extension: phone.extension ?? null,
                                      isPreferred: phone.isPreferred ?? false,
                                      phoneId: phone.phoneId ?? null,
                                      phoneType:
                                          phone.phoneType ?? PhoneType.MOBILE,
                                      startDate: phone.startDate ?? null,
                                      timezone: phone.timezone ?? null,
                                  }))
                                : [
                                      {
                                          phoneType: PhoneType.MOBILE,
                                          areaCode: null,
                                          bestTime: null,
                                          countryCode: 'US',
                                          dialNumber: null,
                                          endDate: null,
                                          extension: null,
                                          isPreferred: false,
                                          phoneId: null,
                                          startDate: null,
                                          timezone: null,
                                      },
                                  ],
                        identifications: getIdentifications(
                            annuitant.identifications
                        ),
                        addresses:
                            annuitant.addresses.length > 0
                                ? annuitant.addresses.map(
                                      (address: ExtendedAddress) => ({
                                          addressId: address.addressId ?? null,
                                          addressType:
                                              address?.addressType ??
                                              AddressType.RESIDENCE,
                                          addressLine1:
                                              address?.addressLine1 ?? null,
                                          addressLine2:
                                              address?.addressLine2 ?? null,
                                          addressLine3:
                                              address?.addressLine3 ?? null,
                                          city: address?.city ?? null,
                                          state: address?.state ?? null,
                                          zipCode: address?.zipCode ?? null,
                                          zipCodeExtension:
                                              address?.zipCodeExtension ?? null,
                                          country: address?.country ?? 'US',
                                          endDate: address?.endDate ?? null,
                                          isPreferred:
                                              address?.isPreferred ?? false,
                                          startDate: address?.startDate ?? null,
                                      })
                                  )
                                : [
                                      {
                                          addressType: AddressType.RESIDENCE,
                                          addressLine1: '',
                                          addressLine2: null,
                                          city: '',
                                          state: null,
                                          zipCode: '',
                                          zipCodeExtension: null,
                                      },
                                  ],
                    },
                };
            });
        return annuitantData;
    };

    const annuitantData = getAnnuitantsByRole(PartyRoleType.ANNUITANT);
    const jointAnnuitantData = getAnnuitantsByRole(
        PartyRoleType.JOINTANNUITANT
    );

    return [...annuitantData, ...jointAnnuitantData];
};

const annuitantChangeHandler: TaskHandler<BeneficiaryTaskPayload, any> = {
    api: async (
        payload: BeneficiaryTaskPayload,
        accessToken: string | undefined
    ) => {
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
        category: ['Annuitant Change', 'Party Change'],
        businessProcess: task?.process,
        carrier: task?.carrier,
        policyNumber: task?.data?.policyNumber,
        planCode: task?.data?.planCode,
        logCtx,
    }),

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
            Object.assign(task, {
                data: {
                    ...task.data,
                    contractInfo: {
                        parties: formatParties(policy),
                    },
                    actionData: formatAnnuitants(policy),
                    signatureData: {
                        signatures: [
                            {
                                isSignedPresent: false,
                                signDate: null,
                                signDesignation: null,
                                signType: 'OWNER',
                                signTypeForUI: 'Owner',
                            },
                            {
                                isSignedPresent: false,
                                signDate: null,
                                signDesignation: null,
                                signType: 'JOINT_OWNER',
                                signTypeForUI: 'Joint Owner',
                            },
                            {
                                isSignedPresent: false,
                                signDate: null,
                                signDesignation: null,
                                signType: 'IRREVOCABLE',
                                signTypeForUI: 'Irrevocable Beneficiary',
                            },
                        ],
                    },
                },
            });
        }
    },
};

export default annuitantChangeHandler;
