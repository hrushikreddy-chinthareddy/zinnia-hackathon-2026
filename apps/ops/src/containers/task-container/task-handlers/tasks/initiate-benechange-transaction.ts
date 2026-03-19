import { TabTitle } from '@deps/components/dynamic-form/customization/templates/transaction-accordion/types';
import { Action, EntityTypeValue } from '@deps/constants/policy';
import { ExtendedAddress } from '@deps/contexts/RoleChangeContext';
import { isEndDated } from '@deps/helpers/date.helpers';
import { toTitleCase } from '@deps/helpers/string.helpers';
import {
    EmailType,
    IdentificationType,
    PartyType,
    PhoneType,
    RelationshipToInsured,
} from '@deps/models/policy/sor-policy';
import { NigoSearch } from '@deps/queries/api/nigo-search';
import { getPolicyDetailsSsr } from '@deps/queries/api/policies';
import { LoggingContext } from '@deps/utils/server-logging';

import { getFormattedPhoneNumber } from '../../task.helpers';
import {
    TaskHandler,
    Reason,
    BeneficiaryTaskPayload,
    AddressType,
    PartyRoleType,
    PartyRole,
    Party,
    PolicyResponse,
    normalizeTaskPayloadAddressType,
    normalizeTaskPayloadEmailType,
    normalizeTaskPayloadPhoneType,
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

export const formatContractInfo = (policyResponse: PolicyResponse) => {
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
        trustDate: party?.trustDate ?? null,
        addresses: getAddresses(party?.addresses ?? []),
        identifications: getIdentifications(party.identifications),
        emails:
            party.emails.length > 0
                ? party.emails.map((email: any) => ({
                      emailAddress: email.emailAddress ?? null,
                      emailType: normalizeTaskPayloadEmailType(email.emailType),
                  }))
                : [
                      {
                          emailAddress: null,
                          emailType: EmailType.PERSONAL,
                      },
                  ],
        phones:
            party.phones.length > 0
                ? [party.phones[0]].map((phone: any) => {
                      const dialNumber = phone?.dialNumber ?? '';
                      return {
                          areaCode:
                              phone?.areaCode ??
                              (dialNumber.length >= 10
                                  ? dialNumber.slice(
                                        dialNumber.length - 10,
                                        dialNumber.length - 7
                                    )
                                  : null),
                          bestTime: phone?.bestTime ?? null,
                          countryCode:
                              phone?.countryCode ??
                              (dialNumber.length > 10
                                  ? dialNumber.slice(0, dialNumber.length - 10)
                                  : null),
                          dialNumber:
                              dialNumber.length > 0
                                  ? getFormattedPhoneNumber(phone) ?? null
                                  : null,
                          endDate: phone?.endDate ?? null,
                          extension: phone?.extension ?? null,
                          isPreferred: phone?.isPreferred ?? false,
                          phoneId: phone?.phoneId ?? null,
                          phoneType: normalizeTaskPayloadPhoneType(
                              phone?.phoneType
                          ),
                          startDate: phone?.startDate ?? null,
                          timezone: phone?.timezone ?? null,
                      };
                  })
                : [
                      {
                          areaCode: null,
                          bestTime: null,
                          countryCode: null,
                          dialNumber: null,
                          endDate: null,
                          extension: null,
                          isPreferred: false,
                          phoneId: null,
                          phoneType: PhoneType.HOME,
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
    console.log('parties', parties || 'no parties');

    return parties;
};

export const formatBeneficiaries = (policyResponse: PolicyResponse) => {
    const getBeneficiariesByRole = (roleType: string) => {
        const partyIds = policyResponse.partyRoles
            .filter(
                (role: PartyRole) =>
                    role.partyRole === roleType &&
                    (!role?.endDate || !isEndDated(role?.endDate))
            )
            .map((role: PartyRole) => role.partyId);

        const beneData = policyResponse.parties
            .filter((party: any) => partyIds.includes(party.partyId))
            .map((bene: any) => {
                const role = policyResponse.partyRoles.find(
                    (r: PartyRole) =>
                        r.partyId === bene.partyId && r.partyRole === roleType
                );

                return {
                    isPerStirpes: bene.isPerStirpes ?? false,
                    isIrrevocable: bene.isIrrevocable ?? false,
                    action: bene.action ?? Action.NONE,
                    actionType: 'BENE_CHANGE',
                    isRestrictedBeneficiary:
                        bene.isRestrictedBeneficiary ?? false,
                    preferredCommunicationType:
                        bene.preferredCommunicationType ?? null,
                    partyRole: {
                        partyRoleId: role?.partyRoleId ?? '',
                        partyRole: roleType,
                        partyId: bene.partyId ?? '',
                        relationshipToParty:
                            role?.relationshipToParty ??
                            RelationshipToInsured.OTHER,
                    },
                    party: {
                        partyId: bene.partyId ?? null,
                        partyType: bene.partyType,
                        prefix: getPrefix(bene.prefix),
                        firstName: bene.firstName ?? null,
                        middleName: bene.middleName ?? null,
                        lastName:
                            bene.lastName ||
                            (bene.partyType !== PartyType.INDIVIDUAL
                                ? bene.fullName
                                : null) ||
                            null,
                        suffix: bene.suffix ?? null,
                        trustType: bene.trustType ?? null,
                        trustDate: bene.trustDate ?? null,
                        entityType: bene.entityType ?? EntityTypeValue.Other,
                        gender: bene.gender ?? null,
                        dateOfBirth: bene.dateOfBirth ?? null,
                        documents: bene.documents ?? [],
                        endDate: bene.endDate ?? null,
                        fullName: toTitleCase(
                            [
                                bene.prefix,
                                bene.firstName,
                                bene.middleName,
                                bene.lastName,
                                bene.suffix,
                            ]
                                .filter(Boolean)
                                .join(' ')
                        ),
                        emails:
                            bene.emails.length > 0
                                ? bene.emails.map((email: any) => ({
                                      emailAddress: email.emailAddress ?? null,
                                      emailId: email.emailId ?? null,
                                      emailType: normalizeTaskPayloadEmailType(
                                          email.emailType
                                      ),
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
                            bene.phones.length > 0
                                ? [bene.phones[0]].map((phone: any) => {
                                      const dialNumber =
                                          phone?.dialNumber ?? '';
                                      return {
                                          areaCode:
                                              phone?.areaCode ??
                                              (dialNumber.length >= 10
                                                  ? dialNumber.slice(
                                                        dialNumber.length - 10,
                                                        dialNumber.length - 7
                                                    )
                                                  : null),
                                          bestTime: phone.bestTime ?? null,
                                          countryCode:
                                              phone?.countryCode ??
                                              (dialNumber.length > 10
                                                  ? dialNumber.slice(
                                                        0,
                                                        dialNumber.length - 10
                                                    )
                                                  : null),
                                          dialNumber:
                                              dialNumber.length > 0
                                                  ? getFormattedPhoneNumber(
                                                        phone
                                                    ) ?? null
                                                  : null,
                                          endDate: phone.endDate ?? null,
                                          extension: phone.extension ?? null,
                                          isPreferred:
                                              phone.isPreferred ?? false,
                                          phoneId: phone.phoneId ?? null,
                                          phoneType:
                                              normalizeTaskPayloadPhoneType(
                                                  phone.phoneType
                                              ),
                                          startDate: phone.startDate ?? null,
                                          timezone: phone.timezone ?? null,
                                      };
                                  })
                                : [
                                      {
                                          phoneType: PhoneType.HOME,
                                          areaCode: null,
                                          bestTime: null,
                                          countryCode: null,
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
                            bene.identifications
                        ),
                        addresses:
                            bene.addresses.length > 0
                                ? bene.addresses.map(
                                      (address: ExtendedAddress) => ({
                                          addressId: address.addressId ?? null,
                                          addressType:
                                              normalizeTaskPayloadAddressType(
                                                  address?.addressType
                                              ),
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
                                          country: address?.country ?? 'USA',
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
                        beneficiaryPercentage: bene.beneficiaryPercentage ?? 0,
                    },
                };
            });

        return beneData;
    };

    const primaryBeneficiaries = getBeneficiariesByRole(
        PartyRoleType.PRIMARYBENEFICIARY
    );
    const contingentBeneficiaries = getBeneficiariesByRole(
        PartyRoleType.CONTINGENTBENEFICIARY
    );

    return [...primaryBeneficiaries, ...contingentBeneficiaries];
};

export const formatParties = (policyResponse: PolicyResponse) => {
    const getPartiesByRole = (roleType: string) => {
        const partyIds = policyResponse.partyRoles
            .filter(
                (role: PartyRole) =>
                    role.partyRole === roleType &&
                    (!role?.endDate || !isEndDated(role?.endDate))
            )
            .map((role: PartyRole) => role.partyId);

        const partiesData = policyResponse.parties
            .filter((party: any) => partyIds.includes(party.partyId))
            .map((party: any) => {
                const role = policyResponse.partyRoles.find(
                    (r: PartyRole) =>
                        r.partyId === party.partyId && r.partyRole === roleType
                );

                return {
                    isPerStirpes: party.isPerStirpes ?? false,
                    isIrrevocable: party.isIrrevocable ?? false,
                    action: party.action ?? Action.NONE,
                    actionType: 'BENE_CHANGE',
                    isRestrictedBeneficiary:
                        party.isRestrictedBeneficiary ?? false,
                    preferredCommunicationType:
                        party.preferredCommunicationType ?? null,
                    partyRole: {
                        partyRoleId: role?.partyRoleId ?? '',
                        partyRole: roleType,
                        partyId: party.partyId ?? '',
                        relationshipToParty:
                            role?.relationshipToParty ??
                            RelationshipToInsured.OTHER,
                    },
                    party: {
                        partyId: party.partyId ?? null,
                        partyType: party.partyType,
                        prefix: getPrefix(party.prefix),
                        firstName: party.firstName ?? null,
                        middleName: party.middleName ?? null,
                        lastName:
                            party.lastName ||
                            (party.partyType !== PartyType.INDIVIDUAL
                                ? party.fullName
                                : null) ||
                            null,
                        suffix: party.suffix ?? null,
                        trustType: party.trustType ?? null,
                        trustDate: party.trustDate ?? null,
                        entityType: party.entityType ?? EntityTypeValue.Other,
                        gender: party.gender ?? null,
                        dateOfBirth: party.dateOfBirth ?? null,
                        documents: party.documents ?? [],
                        endDate: party.endDate ?? null,
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
                        emails:
                            party.emails.length > 0
                                ? party.emails.map((email: any) => ({
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
                            party.phones.length > 0
                                ? party.phones.map((phone: any) => {
                                      const dialNumber =
                                          phone?.dialNumber ?? '';
                                      return {
                                          areaCode:
                                              phone?.areaCode ??
                                              (dialNumber.length >= 10
                                                  ? dialNumber.slice(
                                                        dialNumber.length - 10,
                                                        dialNumber.length - 7
                                                    )
                                                  : null),
                                          bestTime: phone.bestTime ?? null,
                                          countryCode:
                                              phone?.countryCode ??
                                              (dialNumber.length > 10
                                                  ? dialNumber.slice(
                                                        0,
                                                        dialNumber.length - 10
                                                    )
                                                  : null),
                                          dialNumber:
                                              dialNumber.length > 0
                                                  ? getFormattedPhoneNumber(
                                                        phone
                                                    ) ?? null
                                                  : null,
                                          endDate: phone.endDate ?? null,
                                          extension: phone.extension ?? null,
                                          isPreferred:
                                              phone.isPreferred ?? false,
                                          phoneId: phone.phoneId ?? null,
                                          phoneType:
                                              phone.phoneType ?? PhoneType.HOME,
                                          startDate: phone.startDate ?? null,
                                          timezone: phone.timezone ?? null,
                                      };
                                  })
                                : [
                                      {
                                          phoneType: PhoneType.HOME,
                                          areaCode: null,
                                          bestTime: null,
                                          countryCode: null,
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
                            party.identifications
                        ),
                        addresses:
                            party.addresses.length > 0
                                ? party.addresses.map(
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
                                          country: address?.country ?? 'USA',
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
                        beneficiaryPercentage: party.beneficiaryPercentage ?? 0,
                    },
                };
            });

        return partiesData;
    };

    const ownerParties = getPartiesByRole(PartyRoleType.OWNER);
    const jointOwnerParties = getPartiesByRole(PartyRoleType.JOINTOWNER);
    const insuredParties = getPartiesByRole(PartyRoleType.INSURED);
    const annuitantParties = getPartiesByRole(PartyRoleType.ANNUITANT);

    return [
        ...ownerParties,
        ...jointOwnerParties,
        ...insuredParties,
        ...annuitantParties,
    ];
};

const beneChangeHandler: TaskHandler<BeneficiaryTaskPayload, any> = {
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

    getPayload: (task: any, logCtx?: LoggingContext) => {
        const categories = task?.data?.categories || [];

        return {
            category: categories,
            businessProcess: task?.process,
            carrier: task?.carrier,
            policyNumber: task?.data?.policyNumber,
            planCode: task?.data?.planCode,
            logCtx,
        };
    },

    transformResponse: async (response, metadata, task) => {
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

                if (selectOptions.length > 0) {
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

        const declineReasonUiSchema = {
            'ui:options': {
                label: true,
                widget: 'CheckBoxesSelectWidget',
                enumOptions: declineReasonOptions,
            },
            'ui:dataPath': ['declineReason'],
        };

        metadata.forEach((tab: any) => {
            if (
                tab.title === TabTitle.ReviewFormData ||
                tab.title === TabTitle.FormReview
            ) {
                tab.uiSchema.declineReason = declineReasonUiSchema;
            }
        });

        if (task) {
            Object.assign(task, {
                data: {
                    ...task.data,
                    contractInfo: {
                        parties: formatContractInfo(policyResponse),
                    },
                    actionData: formatBeneficiaries(policyResponse),
                    partyData: formatParties(policyResponse),
                },
            });
        }
    },
};

export default beneChangeHandler;
