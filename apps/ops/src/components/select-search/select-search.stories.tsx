import '@deps/styles/styles.css';
import { Meta } from '@storybook/react';

import { FieldSize } from '@deps/components/fields/field';
import NavElement, {
    NavElementType,
} from '@deps/components/nav-element/nav-element';

import SelectSearch from './select-search';

export default {
    title: 'Components/SelectSearch',
    component: SelectSearch,
    decorators: [
        (Story) => (
            <div className="container">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof SelectSearch>;

const values = [
    {
        key: 'policyIssueDate',
        label: 'Issue date',
        group: 'policy_details',
        value: '2023-03-28',
        tooltip: '',
        groupLabel: 'Policy Details',
    },
    {
        key: 'freeLookExpirationDate',
        label: 'Free look expiration date',
        group: 'policy_details',
        value: '2023-04-11',
        tooltip: '',
        groupLabel: 'Policy Details',
    },
    {
        key: 'maturityDate',
        label: 'Maturity date',
        group: 'policy_details',
        value: '2125-03-27',
        tooltip: '',
        groupLabel: 'Policy Details',
    },
    {
        key: 'costBasis',
        label: 'Cost basis',
        group: 'premium',
        value: 60,
        tooltip: '',
        groupLabel: 'Premium',
    },
    {
        key: 'totalPremiumAmount',
        label: 'Total premium YTD',
        group: 'premium',
        value: 0,
        tooltip: '',
        groupLabel: 'Premium',
    },
    {
        key: 'cumulativePremiumSinceIssue',
        label: 'Total premium all time',
        group: 'premium',
        value: 60,
        tooltip: '',
        groupLabel: 'Premium',
    },
];

const errorMessage = (
    <>
        Not finding what you need?{' '}
        <NavElement type={NavElementType.Link} className="inline !px-0 !py-0">
            Browse this policy
        </NavElement>{' '}
        for a full list of values.
    </>
);

export const Default = () => (
    <SelectSearch
        classNames="max-w-[328px]"
        values={values}
        size={FieldSize.Small}
        errorMessage={errorMessage}
    />
);

export const Group = () => (
    <SelectSearch
        classNames="max-w-[328px]"
        values={values}
        size={FieldSize.Small}
        group={true}
        errorMessage={errorMessage}
    />
);
