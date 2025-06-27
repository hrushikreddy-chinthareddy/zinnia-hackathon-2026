import { Policy, PolicyDates } from '@zinnia/api-types/types/sor';

import { DataDefinition } from '@deps/types/data';

export type PolicyDatesDto = PolicyDates;

export const toPolicyDatesDto = ({ policyDates }: Policy): PolicyDatesDto =>
    policyDates as PolicyDates;

export const PolicyDatesInfo = (): DataDefinition<PolicyDatesDto>[] => [
    {
        key: 'policyStartDate',
        label: 'Policy Start Date',
    },
    {
        key: 'applicationDate',
        label: 'Application Date',
    },
    {
        key: 'issueDate',
        label: 'Policy Issue Date',
    },
    {
        key: 'contestabilityStartDate',
        label: 'Contestability Start Date',
    },
    {
        key: 'contestabilityEndDate',
        label: 'Contestability End Date',
    },
    {
        key: 'policyDeliveryDate',
        label: 'Policy Delivery Date',
    },
    {
        key: 'nextAnniversaryDate',
        label: 'Next Policy Anniversary Date',
    },
    {
        key: 'maturityDate',
        label: 'Policy Maturity Date',
    },
    {
        key: 'policyTerminationDate',
        label: 'Policy Termination Date',
    },
    {
        key: 'dateOfDeathReportedNotification',
        label: 'Date of Death',
    },
    {
        key: 'initialPaymentExpiryDate',
        label: 'Initial Payment Expiration Date',
    },
    {
        key: 'nextMonthiversaryDate',
        label: 'Next Policy Monthiversary Date',
    },
];
