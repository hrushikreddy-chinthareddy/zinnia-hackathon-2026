import { TFunction } from 'next-i18next';

import { ReactComponent as UserCircleIcon } from '@deps/styles/elements/icons/icons_outlined/user-circle.svg';

export enum ParentKeys {
    Documents = 'documents',
    Activity = 'activity',
    People = 'people',
    Policy = 'policy',
    Transactions = 'transactions',
}
export interface SubLink {
    href?: string;
    startIcon?: JSX.Element;
    text: string;
    subLinks?: SubLink[];
}

export interface NestedSubLink extends SubLink {
    parentKey?: ParentKeys;
}

export const getReRegNavLinks = (clientId: string, policyId: string, t: TFunction): NestedSubLink[] => [
    {
        text: t('site.navLinks.people.text'),
        href: `re-reg?policyNumber=${policyId}&clientId=${clientId}` || '',
        startIcon: <UserCircleIcon key="table" />,
        parentKey: ParentKeys.People,
    },
];
