import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';

import { CaseSearchAdditionalFilters } from '@deps/contexts/CaseManagementFilters';
import { Case, Metadata, StatCount, Statuses } from '@deps/models/case/case';
import { IdentifierInstance } from '@deps/models/case/identifier-instance';
import { PartyInstance } from '@deps/models/case/party-instance';
import { ExceptionStatus } from '@deps/queries/tanstack/dashboard/types';
import { LabelValue } from '@deps/types/data';
import { PolicySearchKeys, SearchViewQuery } from '@deps/types/search';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';

export const isSearchValueObjectEmpty = (
    searchValueObject: Partial<Record<PolicySearchKeys, string>> = {}
): boolean => {
    return Object.keys(searchValueObject).length === 0;
};

// Combine all sources or just fetch one? API is currently just fetching the toggled view.
export const getSearchValueObject = (
    {
        ownerFirstName = '',
        ownerLastName = '',
        policyNumber = '',
        ssn = '',
        caseId = '',
        agentFirstName = '',
        agentLastName = '',
        agentSsn = '',
        firmName = '',
        documentNumber = '',
        fullName = '',
    }: SearchViewQuery,
    toggleValue: PolicySearchKeys
): SearchViewQuery => {
    switch (toggleValue) {
        case 'policyNumber':
            return policyNumber ? { policyNumber } : {};
        case 'ssn':
            return ssn ? { ssn: ssn.replaceAll('-', '') } : {};
        case 'agentSsn':
            return agentSsn ? { agentSsn: agentSsn.replaceAll('-', '') } : {};
        case 'ownerFirstName':
        case 'ownerLastName':
        case 'fullName':
            return {
                ...(ownerFirstName ? { ownerFirstName } : {}),
                ...(ownerLastName ? { ownerLastName } : {}),
                ...(fullName ? { fullName } : {}),
            };
        case 'caseId':
            return caseId ? { caseIds: [caseId] } : {};
        case 'documentNumber':
            return documentNumber
                ? {
                      identifiers: [
                          {
                              identifier: 'documentNumber',
                              value: documentNumber,
                          },
                      ],
                  }
                : {};
        case 'agentName':
            return {
                ...(agentFirstName ? { agentFirstName } : {}),
                ...(agentLastName ? { agentLastName } : {}),
            };
        case 'firmName':
            return firmName.trim() ? { brokerDealerName: firmName.trim() } : {};
        default:
            return {};
    }
};

type AdditionalFiltersResult = {
    brokerDealerName?: string;
    createdDateStart?: string;
    createdDateEnd?: string;
    updatedDateStart?: string;
    updatedDateEnd?: string;
    process?: string[];
    carrier?: string[];
    productName?: string[];
    requestSubType?: string[];
    caseStatus?: Statuses[];
    notInCaseStatus?: Statuses[];
    category?: string;
    reason?: string;
    detailedReason?: string;
    escalated?: boolean;
    issueStatus?: ExceptionStatus[];
};

// Get additional filters based on the filters selected
export const getAdditionalFilters = (
    additionalFilters: CaseSearchAdditionalFilters
): AdditionalFiltersResult => {
    const result: AdditionalFiltersResult = {};

    // The API expects the date format to be "2004-08-06T14:15:25.083Z" format.
    // The date picker returns the date in MMDDYYYY format.
    // So we need to convert the date to the format the API expects, and make it the startOf or endOf
    // the day of the current timezone for the user.

    function formatDateFromDatePicker(date: string, isStartDate: boolean) {
        const dateParts = [
            date.slice(0, 2),
            date.slice(2, 4),
            date.slice(4, 8),
        ];
        const dateInLocalTimezone = dayjs(
            `${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`
        );
        return isStartDate
            ? dateInLocalTimezone.startOf('day').format()
            : dateInLocalTimezone.endOf('day').format();
    }

    function dateToString(dateObject: Date) {
        const date = dateObject.getDate();
        const month = dateObject.getMonth() + 1;
        const year = dateObject.getFullYear();
        const dateParts = [
            month.toString().padStart(2, '0'),
            date.toString().padStart(2, '0'),
            year.toString(),
        ];
        return dateParts.join('');
    }

    function getDateWithDaysOffset(daysOffset: number): Date {
        const newDate = new Date();
        newDate.setDate(newDate.getDate() - daysOffset);
        return newDate;
    }

    if (additionalFilters.createdDateStart) {
        result['createdDateStart'] = formatDateFromDatePicker(
            additionalFilters.createdDateStart,
            true
        );
    }

    if (additionalFilters.createdDateEnd) {
        result['createdDateEnd'] = formatDateFromDatePicker(
            additionalFilters.createdDateEnd,
            false
        );
    }

    if (additionalFilters.updatedDateStart) {
        result['updatedDateStart'] = formatDateFromDatePicker(
            additionalFilters.updatedDateStart,
            true
        );
    }

    if (additionalFilters.updatedDateEnd) {
        result['updatedDateEnd'] = formatDateFromDatePicker(
            additionalFilters.updatedDateEnd,
            false
        );
    }

    if (additionalFilters.age) {
        switch (additionalFilters.age) {
            case '7':
                result['createdDateStart'] = formatDateFromDatePicker(
                    dateToString(getDateWithDaysOffset(7)),
                    true
                );
                result['createdDateEnd'] = formatDateFromDatePicker(
                    dateToString(new Date()),
                    false
                );
                break;
            case '14':
                result['createdDateStart'] = formatDateFromDatePicker(
                    dateToString(getDateWithDaysOffset(14)),
                    true
                );
                result['createdDateEnd'] = formatDateFromDatePicker(
                    dateToString(getDateWithDaysOffset(7)),
                    false
                );
                break;
            case '30':
                result['createdDateStart'] = formatDateFromDatePicker(
                    dateToString(getDateWithDaysOffset(30)),
                    true
                );
                result['createdDateEnd'] = formatDateFromDatePicker(
                    dateToString(getDateWithDaysOffset(15)),
                    false
                );
                break;
            case '31':
                result['createdDateStart'] = formatDateFromDatePicker(
                    dateToString(new Date('01/01/1970')),
                    true
                );
                result['createdDateEnd'] = formatDateFromDatePicker(
                    dateToString(getDateWithDaysOffset(31)),
                    false
                );
                break;
        }
    }

    if (additionalFilters.processTypes.size) {
        result['process'] = Array.from(additionalFilters.processTypes);
    }

    if (
        additionalFilters.carriers &&
        Object.keys(additionalFilters.carriers).length
    ) {
        result['carrier'] = Object.keys(additionalFilters.carriers)
            .map((code) => code.split(','))
            .concat()
            .flat()
            .map((code) => code.toUpperCase());
    }

    if (additionalFilters.products.size) {
        result['productName'] = Array.from(additionalFilters.products);
    }

    if (additionalFilters.brokerDealerName) {
        result['brokerDealerName'] = additionalFilters.brokerDealerName;
    }

    if (additionalFilters.requestSubType.size) {
        result['requestSubType'] = Array.from(additionalFilters.requestSubType);
    }

    if (additionalFilters.caseStatus) {
        result['caseStatus'] = Array.from(additionalFilters.caseStatus);
    }

    if (additionalFilters.notInCaseStatus) {
        result['notInCaseStatus'] = Array.from(
            additionalFilters.notInCaseStatus
        );
    }

    if (additionalFilters.category) {
        result['category'] = additionalFilters.category;
    }

    if (additionalFilters.reason) {
        result['reason'] = additionalFilters.reason;
    }

    if (additionalFilters.detailedReason) {
        result['detailedReason'] = additionalFilters.detailedReason;
    }

    if (additionalFilters.issueStatus) {
        result['issueStatus'] = Array.from(additionalFilters.issueStatus);
    }
    if (additionalFilters.escalated !== null) {
        result['escalated'] = additionalFilters.escalated;
    }

    return result;
};

export const toggleLabels =
    (featureFlags: FeatureFlags) =>
    (t: TFunction): LabelValue<PolicySearchKeys>[] => {
        const labels: LabelValue<PolicySearchKeys>[] = [
            {
                label: t('dashboard.search.buttons.policyNumber'),
                value: 'policyNumber',
                placeholder:
                    t('dashboard.search.buttons.policyPlaceholder') ?? '',
                errorMessage: t(
                    'dashboard.search.error.policyNumber'
                ) as string,
            },
            {
                label: t('caseManagementDashboard.case.caseId'),
                value: 'caseId',
                placeholder:
                    t('dashboard.search.buttons.policyPlaceholder') ?? '',
                errorMessage: t('dashboard.search.error.caseId') as string,
            },
            {
                label: t('dashboard.search.buttons.ownerSsn'),
                value: 'ssn',
                fullLabel: t('dashboard.search.buttons.ssnFullLabel') ?? '',
                placeholder: t('dashboard.search.buttons.ssnPlaceholder') ?? '',
                format: '###-##-####',
                replaceValue: '-',
                errorMessage: t('dashboard.search.error.ssn') as string,
            },
            {
                label: t('dashboard.search.buttons.name'),
                value: 'ownerFirstName',
                ...(featureFlags.enterprise_search_trust_or_organization
                    ? {
                          group: [
                              {
                                  label: t(
                                      'dashboard.search.buttons.firstName'
                                  ),
                                  value: 'ownerFirstName',
                                  placeholder: '',
                                  errorMessage: t(
                                      'dashboard.search.error.firstName'
                                  ) as string,
                              },
                              {
                                  label: t('dashboard.search.buttons.lastName'),
                                  value: 'ownerLastName',
                                  placeholder: '',
                                  errorMessage: t(
                                      'dashboard.search.error.lastName'
                                  ) as string,
                              },
                              {
                                  label: t('dashboard.search.buttons.fullName'),
                                  value: 'fullName',
                                  placeholder: 'Trust or organization',
                                  errorMessage: t(
                                      'dashboard.search.error.fullName'
                                  ) as string,
                              },
                          ],
                      }
                    : {
                          group: [
                              {
                                  label: t(
                                      'dashboard.search.buttons.firstName'
                                  ),
                                  value: 'firstName',
                                  placeholder: '',
                                  errorMessage: t(
                                      'dashboard.search.error.firstName'
                                  ) as string,
                              },
                              {
                                  label: t('dashboard.search.buttons.lastName'),
                                  value: 'lastName',
                                  placeholder: '',
                                  errorMessage: t(
                                      'dashboard.search.error.lastName'
                                  ) as string,
                              },
                          ],
                      }),
            },
            {
                label: t('dashboard.search.buttons.agentName'),
                value: 'agentName',
                group: [
                    {
                        label: t('dashboard.search.buttons.firstName'),
                        value: 'agentFirstName',
                        placeholder: '',
                        errorMessage: t(
                            'dashboard.search.error.firstName'
                        ) as string,
                    },
                    {
                        label: t('dashboard.search.buttons.lastName'),
                        value: 'agentLastName',
                        placeholder: '',
                        errorMessage: t(
                            'dashboard.search.error.lastName'
                        ) as string,
                    },
                ],
            },
            {
                label: t('dashboard.search.buttons.agentSsn'),
                value: 'agentSsn',
                fullLabel: t('dashboard.search.buttons.ssnFullLabel') ?? '',
                placeholder: t('dashboard.search.buttons.ssnPlaceholder') ?? '',
                format: '###-##-####',
                replaceValue: '-',
                errorMessage: t('dashboard.search.error.ssn') as string,
            },
            {
                label: t('dashboard.search.buttons.firmName'),
                value: 'firmName',
                placeholder: t('dashboard.search.buttons.firmName') ?? '',
                errorMessage: t('dashboard.search.error.firmName') as string,
            },
            {
                label: t('caseManagementDashboard.case.documentNumber'),
                value: 'documentNumber',
                placeholder: t('dashboard.search.buttons.documentNumber') ?? '',
                errorMessage: t(
                    'dashboard.search.error.documentNumber'
                ) as string,
            },
        ];
        return labels;
    };

export const calculateDaysAgo = (date: Date): number => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 3600);
    const diffInDays = Math.floor(diffInHours / 24);

    // If the dates are different but there is less than 24 hours, return 1 day
    if (now.getDate() !== date.getDate() && diffInHours < 24) {
        return 1;
    }

    return diffInDays;
};

export const insertStepDetails = (caseDetails: Case, metadata: Metadata) => {
    const newStages = caseDetails.stages.map((stage) => {
        const stageMetadata = metadata.stages[stage.id];

        if (!stageMetadata) return stage;

        return {
            ...stage,
            steps: stage.steps?.map((step) => {
                const stepMetadata = stageMetadata.steps[step.id];

                if (!stepMetadata) return step;

                return { ...step, info: stepMetadata.info || '' };
            }),
        };
    });

    caseDetails.stages = newStages;

    return caseDetails;
};

export const formatCaseTotals = (count: number, stats: StatCount) => {
    const keyedStats = stats.counts.reduce((acc, stat) => {
        acc[stat.label] = stat.value;
        return acc;
    }, {} as Record<string, number>);
    const inProgressCount = keyedStats[Statuses.InProgress] ?? 0;
    const exceptionCount = keyedStats[Statuses.Exception] ?? 0;
    const notStartedCount = keyedStats[Statuses.NotStarted] ?? 0;
    const completedCount = keyedStats[Statuses.Completed] ?? 0;
    const canceledCount = keyedStats[Statuses.Canceled] ?? 0;

    return {
        All: count,
        [Statuses.InProgress]: inProgressCount,
        [Statuses.Exception]: exceptionCount,
        [Statuses.NotStarted]: notStartedCount,
        [Statuses.Completed]: completedCount,
        [Statuses.Canceled]: canceledCount,
    };
};

export const getCaseIdentifierValue = (
    identifiers: IdentifierInstance[],
    identifierToSearch: string
) => {
    return (
        identifiers?.find(
            (identifier) => identifier.identifier === identifierToSearch
        )?.value || ''
    );
};

type FullName = {
    fullName?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
};

export const getValidFullName = (owner: PartyInstance | FullName) => {
    let fullName = owner?.fullName;

    if (owner && !fullName) {
        fullName = `${owner?.firstName || ''} ${owner?.middleName || ''} ${
            owner?.lastName || ''
        }`;
    }

    return fullName;
};
