import dayjs from 'dayjs';

import { Action, EntityTypeValue } from '@deps/constants/policy';
import { ExtendedAddress } from '@deps/contexts/RoleChangeContext';
import { isEndDated } from '@deps/helpers/date.helpers';
import { TaskStatus } from '@deps/models/case/task-instance';
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
import { toTitleCase } from '@deps/utils/strings';

import {
    TaskHandler,
    Reason,
    PartyRoleType,
    PolicyResponse,
    AssigneeTaskPayload,
    PartyRole,
    AddressType,
} from '../types';

type signatures = {
    signType: string | null;
    signDate: string | null;
    signDesignation: string | null;
    isSignedPresent: boolean;
};

type notarySignatures = {
    commissionExpiredDate: string | null;
    signDate: string | null;
    isSealPresent: boolean;
    isSignedPresent: boolean;
    signTypeForUI: string | null;
};

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

const formatAssignees = (policyResponse: PolicyResponse) => {
    const getAssigneesByRole = (roleType: string) => {
        const partyIds = policyResponse.partyRoles
            .filter(
                (role: PartyRole) =>
                    role.partyRole === roleType &&
                    (!role?.endDate || !isEndDated(role?.endDate))
            )
            .map((role: PartyRole) => role.partyId);

        const assigneeData = policyResponse.parties
            .filter((party: any) => partyIds.includes(party.partyId))
            .map((party: any) => {
                return {
                    action: party.action ?? Action.NONE,
                    collateralAmount: party?.collateralAmount ?? null,
                    party: {
                        ...party,
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
                        trustTitle: party.trustTitle ?? null,
                        entityType: party.entityType ?? EntityTypeValue.Other,
                        companyName: party.companyName ?? null,
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
                        identifications: getIdentifications(
                            party.identifications
                        ),
                        usCitizen: party.usCitizen ?? null,
                        countryOfCitizenship:
                            party.countryOfCitizenship ?? null,
                        relationshipToTheCurrentOwner:
                            party.relationshipToTheCurrentOwner ?? null,
                        collateralAmount: party.collateralAmount ?? null,
                        preferredCommunicationType:
                            party.preferredCommunicationType ?? null,
                        emails:
                            party.emails?.length > 0
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
                            party.phones?.length > 0
                                ? [party.phones[0]].map((phone: any) => ({
                                      areaCode: phone.areaCode ?? null,
                                      bestTime: phone.bestTime ?? null,
                                      countryCode: phone.countryCode ?? '1',
                                      dialNumber: phone.dialNumber ?? null,
                                      endDate: phone.endDate ?? null,
                                      extension: phone.extension ?? null,
                                      isPreferred: phone.isPreferred ?? false,
                                      phoneId: phone.phoneId ?? null,
                                      phoneType:
                                          phone.phoneType ?? PhoneType.HOME,
                                      startDate: phone.startDate ?? null,
                                      timezone: phone.timezone ?? null,
                                  }))
                                : [
                                      {
                                          phoneType: PhoneType.HOME,
                                          areaCode: null,
                                          bestTime: null,
                                          countryCode: '1',
                                          dialNumber: null,
                                          endDate: null,
                                          extension: null,
                                          isPreferred: false,
                                          phoneId: null,
                                          startDate: null,
                                          timezone: null,
                                      },
                                  ],
                        addresses:
                            party.addresses?.length > 0
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
                                          addressLine1: null,
                                          addressLine2: null,
                                          addressLine3: null,
                                          city: null,
                                          state: null,
                                          zipCode: null,
                                          zipCodeExtension: null,
                                          country: 'US',
                                          isPreferred: true,
                                          startDate: null,
                                          endDate: null,
                                      },
                                  ],
                    },
                };
            });

        return assigneeData;
    };

    const assignees = getAssigneesByRole(PartyRoleType.PRIMARYBENEFICIARY);

    return [...assignees];
};

const assigneeChangeHandler: TaskHandler<AssigneeTaskPayload, any> = {
    api: async (
        payload: AssigneeTaskPayload,
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
                (logCtx ?? {}) as LoggingContext
            ),
        ]);
        return {
            nigoSearchResult,
            policyResult,
        };
    },

    getPayload: (task: any, logCtx?: LoggingContext) => ({
        category: ['Assignee Change'],
        businessProcess: task?.process,
        carrier: task.carrier,
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

                const selectOptions =
                    r.exceptionSubRefs
                        ?.filter(
                            (item: any) =>
                                item.carrier === task?.carrier &&
                                item.process === task?.process
                        )
                        ?.map((item: any) => ({
                            label: item.subNmIdDetail,
                            value: item.subNmId,
                        })) || [];

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
            const formattedAssignees = formatAssignees(policyResponse).map(
                (partyUpdates: {
                    action: string;
                    party: any;
                    collateralAmount: number;
                }) => ({
                    action: partyUpdates.action,
                    collateralAmount: partyUpdates.collateralAmount,
                    party: {
                        ...partyUpdates.party,
                    },
                })
            );

            const normalizedSignatures =
                task.data?.signatures?.length > 0
                    ? task.data.signatures.map(
                          (sig: signatures): signatures => ({
                              signType: sig.signType || null,
                              signDate: sig.signDate || null,
                              signDesignation: sig.signDesignation || null,
                              isSignedPresent: sig.isSignedPresent || false,
                          })
                      )
                    : [
                          {
                              signType: null,
                              signDate: null,
                              signDesignation: null,
                              isSignedPresent: false,
                          },
                      ];

            const normalizedNotarySignatures =
                task.data?.notarySignatures?.length > 0
                    ? task.data.notarySignatures.map(
                          (sig: notarySignatures): notarySignatures => ({
                              commissionExpiredDate:
                                  sig.commissionExpiredDate || null,
                              signDate: sig.signDate || null,
                              isSealPresent: sig.isSealPresent || false,
                              isSignedPresent: sig.isSignedPresent || false,
                              signTypeForUI: sig.signTypeForUI || null,
                          })
                      )
                    : [
                          {
                              commissionExpiredDate: null,
                              signDate: null,
                              isSealPresent: false,
                              isSignedPresent: false,
                              signTypeForUI: null,
                          },
                      ];

            const taskData = {
                ...task.data,
                effectiveDate: dayjs.utc().format(ZAHARA_API_DATE_FORMAT),
                requestType: null,
                collateralAmount: null,
                partyUpdates:
                    task.status === TaskStatus.Completed
                        ? task.data.partyUpdates
                        : formattedAssignees,

                signatures: normalizedSignatures,
                notarySignatures: normalizedNotarySignatures,

                issueResolved: task?.data?.issueResolved ?? true,
            };

            Object.assign(task, { data: taskData });
        }
    },
};

export default assigneeChangeHandler;
