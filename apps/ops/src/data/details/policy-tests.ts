import { DataDefinition } from '@deps/types/data';
import { Policy, TestValues } from '@zinnia/api-types/types/sor';

export type TestValuesDto = TestValues;

export const toTestValuesDto = (policy: Policy): TestValuesDto =>
    policy.testValues as TestValues;

export const PolicyTestsGPTInfo = (): DataDefinition<TestValuesDto>[] => [
    {
        key: 'guidelinePremium.guidelinePremiumTestDate',
        label: 'Guideline Premium Test Date',
    },
    {
        key: 'guidelinePremium.guidelineSinglePremium',
        label: 'Guideline Single Premium',
    },
    {
        key: 'guidelinePremium.guidelineLevelPremium',
        label: 'Guidline Level Premium',
    },
    {
        key: 'guidelinePremium.definitionOfLifeInsurance',
        label: 'Definition of Life Insurance',
    },
    {
        key: 'guidelinePremium.amountExcessToGuideline',
        label: 'Amount Excess to Guideline',
    },
    {
        key: 'guidelinePremium.totalGuidelineLevelPremiumSinceIssue',
        label: 'Total Guideline Level Premium Since Issue',
    },
];

export const PolicyTestsMECInfo = (): DataDefinition<TestValuesDto>[] => [
    {
        key: 'modifiedEndowmentContract.modifiedEndowmentContractTestDate',
        label: 'MEC Test Date',
    },
    {
        key: 'modifiedEndowmentContract.modifiedEndowmentContractStatus',
        label: 'MEC Status',
    },
    {
        key: 'modifiedEndowmentContract.modifiedEndowmentContractStatusDate',
        label: 'MEC Status Date',
    },
    {
        key: 'modifiedEndowmentContract.amountExcessToModifiedEndowmentContract',
        label: 'Amount Excess to MEC',
    },
    {
        key: 'modifiedEndowmentContract.sevenPayPremium',
        label: '7 Pay Premium',
    },
    {
        key: 'modifiedEndowmentContract.sevenPayStartDate',
        label: '7 Pay Start Date / Material Change Date',
    },
    {
        key: 'modifiedEndowmentContract.sevenPayPeriod',
        label: '7 Pay Period Cash Value Accumulation Test',
    },
];
