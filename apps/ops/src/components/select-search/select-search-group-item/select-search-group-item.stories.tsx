import '@deps/styles/styles.css';
import { Meta } from '@storybook/react';

import { ReactComponent as NewspaperIcon } from '@deps/styles/elements/icons/icons_outlined/newspaper.svg';

import SelectSearchGroupItem from './select-search-group-item';

export default {
    title: 'Components/SelectSearchGroupItem',
    component: SelectSearchGroupItem,
    decorators: [
        (Story) => (
            <div className=" container max-w-[1302px]">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof SelectSearchGroupItem>;

const groupArray = [
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
];

export const Default = () => (
    <SelectSearchGroupItem
        icon={<NewspaperIcon height={16.5} width={16.5} />}
        headerText="Header Text"
        groupArray={groupArray}
    />
);
export const NoIcon = () => (
    <SelectSearchGroupItem headerText="Header Text" groupArray={groupArray} />
);
