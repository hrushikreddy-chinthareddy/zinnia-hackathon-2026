import { NigoSearch } from '@deps/queries/api/nigo-search';
import { getPolicyDetailsSsr } from '@deps/queries/api/policies';
import { LoggingContext } from '@deps/utils/server-logging';

import { TaskHandler, Reason, BeneTaskPayload } from '../types';

const formatParties = (policyResponse: any) => {
    const partyRoleMap = policyResponse.partyRoles.reduce(
        (acc: any, role: any) => {
            acc[role.partyRole] = role.partyId;
            return acc;
        },
        {}
    );

    const ownerParty = policyResponse.parties.find(
        (p: any) => p.partyId === partyRoleMap['OWNER']
    );

    const jointOwnerParty = policyResponse.parties.find(
        (p: any) => p.partyId === partyRoleMap['JOINTOWNER']
    );

    const formatAddress = (
        address: any = {},
        type: 'RESIDENCE' | 'MAILING'
    ) => ({
        addressType:
            type === 'RESIDENCE' ? 'Residential Address' : 'Mailing Address',
        addressLine1: address.addressLine1 ?? '',
        city: address?.city ?? '',
        state: address?.state ?? '',
        zipcode: address?.zipcode ?? '',
        zipCodeExtension: address?.zipCodeExtension ?? '',
    });

    const getAddresses = (addresses: any[] = []) => {
        const findByType = (type: 'RESIDENCE' | 'MAILING') =>
            addresses.find(
                (a: any) =>
                    a.addressType?.toUpperCase?.() === type.toUpperCase()
            );
        return [
            formatAddress(findByType('RESIDENCE'), 'RESIDENCE'),
            formatAddress(findByType('MAILING'), 'MAILING'),
        ];
    };

    const formatParty = (
        party: any,
        role: string,
        options: {
            includeAddresses?: boolean;
            includeEmails?: boolean;
            includePhones?: boolean;
        } = {}
    ) => {
        return {
            partyRole: role,
            partyType: party?.partyType,
            firstName: party?.firstName ?? '',
            middleName: party?.middleName ?? '',
            lastName: party?.lastName ?? '',
            dateOfBirth: party?.dateOfBirth ?? '',
            ...(options.includeEmails &&
                party?.emails && { emails: party.emails }),
            ...(options.includePhones &&
                party?.phones && { phones: party.phones }),
            ...(options.includeAddresses && {
                addresses: getAddresses(party?.addresses),
            }),
        };
    };

    const parties = [
        ownerParty &&
            formatParty(ownerParty, 'OWNER', {
                includeAddresses: true,
                includeEmails: true,
                includePhones: true,
            }),
        jointOwnerParty && formatParty(jointOwnerParty, 'JOINT OWNER'),
    ].filter(Boolean);

    return parties;
};

const formatBeneficiaries = (policyResponse: any) => {
    const getBeneficiariesByRole = (roleType: string) => {
        const partyIds = policyResponse.partyRoles
            .filter((role: any) => role.partyRole === roleType)
            .map((role: any) => role.partyId);

        return policyResponse.parties
            .filter((party: any) => partyIds.includes(party.partyId))
            .map((bene: any) => ({
                ...bene,
                relationshipToParty: bene.relationshipToParty ?? 'OTHER',
                isPerStirpes: bene.isPerStirpes ?? 'No',
                isIrrevocable: bene.isIrrevocable ?? 'No',
                action: 'UPDATE',
                partyRole: {
                    ...bene.partyRole,
                    beneficiaryRole:
                        roleType === 'PRIMARYBENEFICIARY'
                            ? 'PRIMARY BENEFICIARY'
                            : 'CONTINGENT BENEFICIARY',
                },
                party: {
                    ...bene.party,
                    partyType: bene.partyType,
                    prefix: bene.prefix ?? '',
                    firstName: bene.firstName ?? '',
                    middleName: bene.middleName ?? '',
                    lastName: bene.lastName ?? '',
                    suffix: bene.suffix ?? '',
                    gender: bene.gender ?? '',
                    dateOfBirth: bene.dateOfBirth ?? '',
                    emails: bene.emails ?? [],
                    phones: bene.phones ?? [],
                    addresses: (bene.addresses ?? []).map((addr: any) => ({
                        addressType: addr?.addressType ?? '',
                        addressLine1: addr?.addressLine1 ?? '',
                        addressLine2: addr?.addressLine2 ?? '',
                        city: addr?.city ?? '',
                        state: addr?.state ?? '',
                        zipCode: addr?.zipCode ?? '',
                        zipCodeExtension: addr?.zipCodeExtension ?? '',
                    })),
                    beneficiaryPercentage: bene.beneficiaryPercentage ?? 0,
                },
            }));
    };

    const primaryBeneficiaries = getBeneficiariesByRole('PRIMARYBENEFICIARY');
    const contingentBeneficiaries = getBeneficiariesByRole(
        'CONTINGENTBENEFICIARY'
    );

    return [...primaryBeneficiaries, ...contingentBeneficiaries];
};

const beneChangeHandler: TaskHandler<BeneTaskPayload, any> = {
    api: async (payload: BeneTaskPayload, accessToken: string | undefined) => {
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
                (logCtx ?? {}) as LoggingContext
            ),
        ]);
        return {
            nigoSearchResult,
            policyResult,
        };
    },

    getPayload: (task: any, logCtx?: LoggingContext) => ({
        category: ['Form', 'Signature', 'Account Information', 'Data Entry'],
        businessProcess: task?.process,
        carrier: task?.carrier,
        policyNumber: task?.data?.policyNumber,
        planCode: task?.data?.planCode,
        logCtx,
    }),

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
                    parties: formatParties(policyResponse),
                    beneData: formatBeneficiaries(policyResponse),
                },
            });
        }
    },
};

export default beneChangeHandler;
