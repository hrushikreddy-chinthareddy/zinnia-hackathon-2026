import { ExtendedAddress } from '@deps/contexts/RoleChangeContext';
import { FormMetadata } from '@deps/models/case/task';
import { PartyType } from '@deps/models/policy/sor-policy';
import { NigoSearch } from '@deps/queries/api/nigo-search';
import { getPolicyDetailsSsr } from '@deps/queries/api/policies';
import { LoggingContext } from '@deps/utils/server-logging';

import {
    TaskHandler,
    Reason,
    BeneficiaryTaskPayload,
    AddressType,
    AddressTypeLabel,
    PartyRoleLabel,
    PartyRoleType,
    PartyRole,
    Party,
    PolicyResponse,
} from '../../containers/task-container/task-handlers/types';

const formatParties = (policyResponse: PolicyResponse) => {
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
                ? AddressTypeLabel.RESIDENCE
                : AddressTypeLabel.MAILING,
        addressLine1: address?.addressLine1 ?? '',
        city: address?.city ?? '',
        state: address?.state ?? '',
        zipCode: address?.zipCode ?? '',
        zipCodeExtension: address?.zipCodeExtension ?? '',
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

    const formatParty = (
        party: Party,
        role: string,
        options: {
            includeAddresses?: boolean;
            includeEmails?: boolean;
            includePhones?: boolean;
        } = {}
    ) => ({
        partyRole: role,
        partyType: party?.partyType,
        firstName: party?.firstName ?? '',
        middleName: party?.middleName ?? '',
        lastName: party?.lastName ?? '',
        dateOfBirth: party?.dateOfBirth ?? '',
        trustType: party?.trustType ?? '',
        ...(options.includeEmails && { emails: party?.emails ?? [] }),
        ...(options.includePhones && { phones: party?.phones ?? [] }),
        ...(options.includeAddresses && {
            addresses: getAddresses(party?.addresses ?? []),
        }),
    });

    const blankPartyTemplate = (roleLabel: string, options: any) => ({
        partyRole: roleLabel,
        partyType: PartyType.INDIVIDUAL,
        firstName: '',
        middleName: '',
        lastName: '',
        dateOfBirth: '',
        trustType: '',
        ...(options.includeEmails && { emails: [] }),
        ...(options.includePhones && { phones: [] }),
        ...(options.includeAddresses && {
            addresses: [
                formatAddress({}, AddressType.RESIDENCE),
                formatAddress({}, AddressType.MAILING),
            ],
        }),
    });

    const rolesToFormat = [
        {
            roleKey: PartyRoleType.OWNER,
            roleLabel: PartyRoleLabel.OWNER,
            options: {
                includeAddresses: true,
                includeEmails: true,
                includePhones: true,
            },
        },
        {
            roleKey: PartyRoleType.JOINTOWNER,
            roleLabel: PartyRoleLabel.JOINTOWNER,
            options: {},
        },
    ];

    const parties = rolesToFormat
        .map(({ roleKey, roleLabel, options }) => {
            const partyId = partyRoleMap[roleKey];
            const party = policyResponse.parties.find(
                (p: Party) => p.partyId === partyId
            );
            return party ? formatParty(party, roleLabel, options) : null;
        })
        .filter(Boolean);

    console.log('parties here:', parties);

    return parties;
};

const formatBeneficiaries = (policyResponse: PolicyResponse) => {
    const getBeneficiariesByRole = (roleType: string) => {
        const partyIds = policyResponse.partyRoles
            .filter((role: PartyRole) => role.partyRole === roleType)
            .map((role: PartyRole) => role.partyId);

        const beneData = policyResponse.parties
            .filter((party: any) => partyIds.includes(party.partyId))
            .map((bene: any) => {
                const role = policyResponse.partyRoles.find(
                    (r: PartyRole) =>
                        r.partyId === bene.partyId && r.partyRole === roleType
                );

                return {
                    ...bene,
                    relationshipToParty: role?.relationshipToParty ?? 'OTHER',
                    isPerStirpes: bene.isPerStirpes ?? 'No',
                    isIrrevocable: bene.isIrrevocable ?? 'No',
                    action: 'UPDATE',
                    partyRole: {
                        ...bene.partyRole,
                        beneficiaryRole:
                            roleType === PartyRoleType.PRIMARYBENEFICIARY
                                ? PartyRoleLabel.PRIMARYBENEFICIARY
                                : PartyRoleLabel.CONTINGENTBENEFICIARY,
                    },
                    party: {
                        ...bene.party,
                        partyType: bene.partyType,
                        preferredCommunicationType:
                            bene.preferredCommunicationType ?? '',
                        prefix: bene.prefix ?? '',
                        firstName: bene.firstName ?? '',
                        middleName: bene.middleName ?? '',
                        lastName: bene.lastName ?? bene.fullName ?? '',
                        suffix: bene.suffix ?? '',
                        trustType: bene.trustType ?? '',
                        entityType: bene.entityType ?? 'UNKNOWN',
                        gender: bene.gender ?? '',
                        dateOfBirth: bene.dateOfBirth ?? '',
                        emails: bene.emails ?? [],
                        phones: bene.phones ?? [],
                        identifications: bene.identifications ?? [],
                        addresses: (bene.addresses ?? []).map(
                            (address: ExtendedAddress) => ({
                                addressType: address?.addressType ?? '',
                                addressLine1: address?.addressLine1 ?? '',
                                addressLine2: address?.addressLine2 ?? '',
                                city: address?.city ?? '',
                                state: address?.state ?? '',
                                zipCode: address?.zipCode ?? '',
                                zipCodeExtension:
                                    address?.zipCodeExtension ?? '',
                            })
                        ),
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

const beneChangeHandler: TaskHandler<BeneficiaryTaskPayload, any> = {
    api: async (
        payload: BeneficiaryTaskPayload,
        accessToken: string | undefined
    ) => {
        const {
            category,
            businessProcess,
            carrier,
            planCode,
            loggingContext,
            id,
        } = payload;
        const [nigoSearchResult, policyResult] = await Promise.all([
            NigoSearch(
                {
                    category,
                    businessProcess,
                    carrier,
                },
                accessToken,
                (loggingContext ?? {}) as LoggingContext
            ),
            getPolicyDetailsSsr(planCode, id, accessToken, loggingContext),
        ]);
        return {
            nigoSearchResult,
            policyResult,
        };
    },

    transformResponse: async (response, metadata, task) => {
        if (!response || response.length === 0) return;

        const nigoResponse = response?.nigoSearchResult;
        console.log(
            'task carrier and task process here:',
            task?.carrier,
            task?.process
        );
        console.log(
            'nigoResponse inside transformResponse here:',
            nigoResponse
        );
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
        console.log('declineReasonOptions here:', declineReasonOptions);

        const updatedMetadata: FormMetadata = {
            ...metadata,
        };

        if (
            updatedMetadata?.schemaContent?.tabSchemas?.[0] &&
            updatedMetadata.schemaContent.tabSchemas[0].uiSchema
        ) {
            updatedMetadata.schemaContent.tabSchemas[0].uiSchema.declineReason =
                {
                    'ui:options': {
                        label: true,
                        widget: 'CheckBoxesSelectWidget',
                        enumOptions: declineReasonOptions,
                    },
                    'ui:dataPath': ['declineReason'],
                };
        }
        console.log('parties formatted:', formatParties(policyResponse));

        console.log('task inside transformResponse here:', task);

        if (task) {
            return {
                metadata: updatedMetadata,
                data: {
                    ...task.data,
                    contractInfo: {
                        parties: formatParties(policyResponse),
                        product: null,
                    },
                    actionData: formatBeneficiaries(policyResponse),
                },
            };
        }
    },
};

export default beneChangeHandler;
