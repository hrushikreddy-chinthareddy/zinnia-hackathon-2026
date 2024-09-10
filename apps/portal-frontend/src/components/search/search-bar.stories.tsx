import { Meta } from '@storybook/react';
import { TFunction } from 'next-i18next';
import { useState } from 'react';

import { LabelValue } from '@deps/types/data';
import { PolicySearchKeys } from '@deps/types/search';

import SearchBar, { SearchBarInitialValues } from './search-bar';
import '@deps/styles/styles.css';

export default {
    title: 'Components/SearchBar',
    component: SearchBar,
    decorators: [
        Story => (
            <div className="container">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof SearchBar>;

const initialToggleValue = 'policyNumber' as PolicySearchKeys;

const toggleLabels = (t: TFunction): LabelValue<PolicySearchKeys>[] => [
    {
        label: t('dashboard.search.buttons.policyNumber'),
        value: 'policyNumber',
        placeholder: '',
    },
    {
        label: t('dashboard.search.buttons.ssn'),
        value: 'ssn',
        fullLabel: t('dashboard.search.buttons.ssnFullLabel') ?? '',
        placeholder: t('dashboard.search.buttons.ssnPlaceholder') ?? '',
        format: '###-##-####',
    },
    {
        label: t('dashboard.search.buttons.name'),
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

export const SearchBarDefault = () => {
    const [searchValue, setSearchValue] = useState(SearchBarInitialValues);

    return (
        <>
            <SearchBar
                onSearch={setSearchValue}
                searchValue={searchValue}
                initialToggleValue={initialToggleValue}
                toggleLabels={toggleLabels}
            />
        </>
    );
};
