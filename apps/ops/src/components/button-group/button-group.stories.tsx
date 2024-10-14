import '@deps/styles/styles.css';

import { Meta } from '@storybook/react';
import { TFunction, useTranslation } from 'next-i18next';
import { useCallback, useState } from 'react';

import { Size, Variant } from '@deps/types/components';
import { LabelValue } from '@deps/types/data';
import { PolicySearchKeys } from '@deps/types/search';

import ButtonGroup from './button-group';

export default {
    title: 'Components/ButtonGroup',
    component: ButtonGroup,
    decorators: [
        Story => (
            <div>
                <Story />
            </div>
        ),
    ],
} as Meta<typeof ButtonGroup>;

export const PrimaryButton = () => {
    const { t } = useTranslation();
    const [activeToggleBtn, setActiveToggleBtn] = useState('policyNumber' as PolicySearchKeys);

    const toggleLabels = (t: TFunction): LabelValue<PolicySearchKeys | 'accessDenied'>[] => [
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
            label: t('site.accessDenied.title'),
            value: 'accessDenied',
            disabled: true,
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

    const handleToggle = useCallback(
        (value: string) => {
            if (!value) {
                value = activeToggleBtn;
            }
            setActiveToggleBtn(value as PolicySearchKeys);
        },
        [toggleLabels(t)]
    );

    const size: Size = 'md';
    const variant: Variant = 'primary';

    return (
        <ButtonGroup
            isFullWidth
            groupLabel="Search buttons"
            activeValue={activeToggleBtn}
            toggle={handleToggle}
            labels={toggleLabels(t)}
            size={size}
            variant={variant}
        />
    );
};

export const WidthAnchoredToLargestButton = () => {
    const [activeToggleBtn, setActiveToggleBtn] = useState('');

    const toggleLabels = (): LabelValue<string>[] => [
        {
            label: 'Button',
            value: 'firstButton',
            placeholder: '',
        },
        {
            label: 'The Largest Button',
            value: 'secondButton',
            placeholder: '',
        },
        {
            label: 'Button',
            value: 'thirdButton',
            placeholder: '',
        },
    ];

    const handleToggle = useCallback(
        (value: string) => {
            if (!value) {
                value = activeToggleBtn;
            }
            setActiveToggleBtn(value as string);
        },
        [toggleLabels()]
    );

    const size: Size = 'md';
    const variant: Variant = 'primary';

    return (
        <ButtonGroup
            groupLabel="Buttons"
            activeValue={activeToggleBtn}
            toggle={handleToggle}
            labels={toggleLabels()}
            size={size}
            variant={variant}
        />
    );
};
