import { Policy, Product } from '@zinnia/api-types/types/sor';

import { DataDefinition } from '@deps/types/data';

export interface PolicyDetailsDto extends Policy, Product {}

export const toPolicyDetailsDto = (policy: Policy): PolicyDetailsDto => policy;

export const PolicyDetailsInfo = (): DataDefinition<PolicyDetailsDto>[] => [
    {
        key: 'carrierId',
        label: 'Carrier ID',
    },
    {
        key: 'thirdPartyAdministratorId',
        label: 'Third Party Administrator ID',
    },
    {
        key: 'lineOfBusiness',
        label: 'Product Line of Business',
    },
    {
        key: 'planName',
        label: 'Product Name',
    },
    {
        key: 'productType',
        label: 'Product Type',
    },
    {
        key: 'marketingName',
        label: 'Product Marketing Name',
    },
    {
        key: 'shortName',
        label: 'Product Short Name',
    },
    {
        key: 'distribution',
        label: 'Distribution',
    },
    {
        key: 'banding',
        label: 'Banding',
    },
    {
        key: 'planCode',
        label: 'Plan Code',
    },
    {
        key: 'generalLedgerPlanCode',
        label: 'GL Product Code',
    },
    {
        key: 'holdingForm',
        label: 'Holding Form',
    },
    {
        key: 'qualificationType',
        label: 'Qualification Type',
    },
    {
        key: 'policyTerm',
        label: 'Policy Term',
    },
    {
        key: 'policyYear',
        label: 'Policy Year',
    },
    {
        key: 'monthOfYear',
        label: 'Policy Months',
    },
    {
        key: 'issueType',
        label: 'Issue Type',
    },
    {
        key: 'issueState',
        label: 'Residence State',
    },
    {
        key: 'issueState',
        label: 'Policy Issue State',
    },
    {
        key: 'currency',
        label: 'Currency',
    },
];
