import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';

import { CaseSearchAdditionalFilters } from '@deps/contexts/CaseManagementFilters';
import { Case, Metadata, StatCount, Statuses } from '@deps/models/case/case';
import { IdentifierInstance } from '@deps/models/case/identifier-instance';
import { LabelValue } from '@deps/types/data';
import { PolicySearchKeys, SearchViewQuery } from '@deps/types/search';

export const isSearchValueObjectEmpty = (
    searchValueObject: Partial<Record<'policyNumber' | 'ssn' | 'ownerFirstName' | 'ownerLastName', string>> = {}
): boolean => {
    return Object.keys(searchValueObject).length === 0;
};

// Combine all sources or just fetch one? API is currently just fetching the toggled view.
export const getSearchValueObject = (
    { ownerFirstName = '', ownerLastName = '', policyNumber = '', ssn = '' }: SearchViewQuery,
    toggleValue: PolicySearchKeys
): Partial<Record<'policyNumber' | 'ssn' | 'ownerFirstName' | 'ownerLastName', string>> => {
    switch (toggleValue) {
        case 'policyNumber':
            return policyNumber ? { policyNumber } : {};
        case 'ssn':
            return ssn ? { ssn: ssn.replaceAll('-', '') } : {};
        case 'ownerFirstName':
        case 'ownerLastName':
            return {
                ...(ownerFirstName ? { ownerFirstName } : {}),
                ...(ownerLastName ? { ownerLastName } : {}),
            };
        default:
            return {};
    }
};

type CaseStatusResult = {
    caseStatus?: Statuses[];
    notInCaseStatus?: Statuses[];
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
};

// Get additional filters based on the filters selected
export const getAdditionalFilters = (additionalFilters: CaseSearchAdditionalFilters): AdditionalFiltersResult => {
    const result: AdditionalFiltersResult = {};

    // The API expects the date format to be "2004-08-06T14:15:25.083Z" format.
    // The date picker returns the date in MMDDYYYY format.
    // So we need to convert the date to the format the API expects, and make it the startOf or endOf
    // the day of the current timezone for the user.

    function formatDateFromDatePicker(date: string, isStartDate: boolean) {
        const dateParts = [date.slice(0, 2), date.slice(2, 4), date.slice(4, 8)];
        const dateInLocalTimezone = dayjs(`${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`);
        return isStartDate ? dateInLocalTimezone.startOf('day').format() : dateInLocalTimezone.endOf('day').format();
    }

    function dateToString(dateObject: Date) {
        const date = dateObject.getDate();
        const month = dateObject.getMonth() + 1;
        const year = dateObject.getFullYear();
        const dateParts = [month.toString().padStart(2, '0'), date.toString().padStart(2, '0'), year.toString()];
        return dateParts.join('');
    }

    function getDateWithDaysOffset(daysOffset: number): Date {
        const newDate = new Date();
        newDate.setDate(newDate.getDate() - daysOffset);
        return newDate;
    }

    if (additionalFilters.createdDateStart) {
        result['createdDateStart'] = formatDateFromDatePicker(additionalFilters.createdDateStart, true);
    }

    if (additionalFilters.createdDateEnd) {
        result['createdDateEnd'] = formatDateFromDatePicker(additionalFilters.createdDateEnd, false);
    }

    if (additionalFilters.updatedDateStart) {
        result['updatedDateStart'] = formatDateFromDatePicker(additionalFilters.updatedDateStart, true);
    }

    if (additionalFilters.updatedDateEnd) {
        result['updatedDateEnd'] = formatDateFromDatePicker(additionalFilters.updatedDateEnd, false);
    }

    if (additionalFilters.age) {
        switch (additionalFilters.age) {
            case '7':
                result['createdDateStart'] = formatDateFromDatePicker(dateToString(getDateWithDaysOffset(7)), true);
                result['createdDateEnd'] = formatDateFromDatePicker(dateToString(new Date()), false);
                break;
            case '14':
                result['createdDateStart'] = formatDateFromDatePicker(dateToString(getDateWithDaysOffset(14)), true);
                result['createdDateEnd'] = formatDateFromDatePicker(dateToString(getDateWithDaysOffset(7)), false);
                break;
            case '30':
                result['createdDateStart'] = formatDateFromDatePicker(dateToString(getDateWithDaysOffset(30)), true);
                result['createdDateEnd'] = formatDateFromDatePicker(dateToString(getDateWithDaysOffset(15)), false);
                break;
            case '31':
                result['createdDateStart'] = formatDateFromDatePicker(dateToString(new Date('01/01/1970')), true);
                result['createdDateEnd'] = formatDateFromDatePicker(dateToString(getDateWithDaysOffset(31)), false);
                break;
        }
    }

    if (additionalFilters.processTypes.size) {
        result['process'] = Array.from(additionalFilters.processTypes);
    }

    if (additionalFilters.carriers && Object.keys(additionalFilters.carriers).length) {
        result['carrier'] = Object.keys(additionalFilters.carriers)
            .map(code => code.split(','))
            .concat()
            .flat()
            .map(code => code.toUpperCase());
    }

    if (additionalFilters.products.size) {
        result['productName'] = Array.from(additionalFilters.products);
    }

    if (additionalFilters.requestSubType.size) {
        result['requestSubType'] = Array.from(additionalFilters.requestSubType);
    }

    if (additionalFilters.caseStatus) {
        result['caseStatus'] = Array.from(additionalFilters.caseStatus);
    }

    if (additionalFilters.notInCaseStatus) {
        result['notInCaseStatus'] = Array.from(additionalFilters.notInCaseStatus);
    }

    return result;
};

export const toggleLabels = (t: TFunction): LabelValue<PolicySearchKeys>[] => [
    {
        label: t('dashboard.search.buttons.policyNumber'),
        value: 'policyNumber',
        placeholder: '',
    },
    {
        label: t('dashboard.search.buttons.ownerSsn'),
        value: 'ssn',
        fullLabel: t('dashboard.search.buttons.ssnFullLabel') ?? '',
        placeholder: t('dashboard.search.buttons.ssnPlaceholder') ?? '',
        format: '###-##-####',
        replaceValue: '-',
    },
    {
        label: t('dashboard.search.buttons.ownerName'),
        value: 'ownerFirstName',
        group: [
            {
                label: t('dashboard.search.buttons.firstName'),
                value: 'ownerFirstName',
                placeholder: '',
            },
            {
                label: t('dashboard.search.buttons.lastName'),
                value: 'ownerLastName',
                placeholder: '',
            },
        ],
    },
];

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
    const newStages = caseDetails.stages.map(stage => {
        const stageMetadata = metadata.stages[stage.id];

        if (!stageMetadata) return stage;

        return {
            ...stage,
            steps: stage.steps?.map(step => {
                const stepMetadata = stageMetadata.steps[step.id];

                if (!stepMetadata) return step;

                return { ...step, info: stepMetadata.info || '' };
            }),
        };
    });

    caseDetails.stages = newStages;

    return caseDetails;
};

export const formatCaseTotals = (count: number, stats: StatCount, hasSearch: boolean) => {
    const keyedStats = stats.counts.reduce((acc, stat) => {
        acc[stat.label] = stat.value;
        return acc;
    }, {} as Record<string, number>);
    const inProgressCount = keyedStats[Statuses.InProgress] ?? 0;
    const exceptionCount = keyedStats[Statuses.Exception] ?? 0;
    const completedCount = keyedStats[Statuses.Completed] ?? 0;
    const canceledCount = keyedStats[Statuses.Canceled] ?? 0;

    // if there's a search, don't mess with the caseStats counts.
    if (hasSearch) {
        return {
            All: count,
            [Statuses.InProgress]: inProgressCount,
            [Statuses.Exception]: exceptionCount,
        };
    }

    const progCt = inProgressCount;
    const excepCt = exceptionCount;
    const allCount = count - completedCount - canceledCount;

    return {
        All: allCount,
        [Statuses.InProgress]: progCt,
        [Statuses.Exception]: excepCt,
    };
};

export const getCaseIdentifierValue = (identifiers: IdentifierInstance[], identifierToSearch: string) => {
    return identifiers.find(identifier => identifier.identifier === identifierToSearch)?.value || '';
};
