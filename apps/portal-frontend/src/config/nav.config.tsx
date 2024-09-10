import { TFunction } from 'next-i18next';

import { ReactComponent as TransactionsIcon } from '@deps/styles/elements/icons/currency/transaction.svg';
import { ReactComponent as CalendarIcon } from '@deps/styles/elements/icons/icons_outlined/calendar.svg';
import { ReactComponent as DocumentIcon } from '@deps/styles/elements/icons/icons_outlined/document-text-2.svg';
import { ReactComponent as ShieldIcon } from '@deps/styles/elements/icons/icons_outlined/shield-magnify.svg';
import { ReactComponent as UserCircleIcon } from '@deps/styles/elements/icons/icons_outlined/user-circle.svg';

export enum ParentKeys {
    Documents = 'documents',
    History = 'history',
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

export const getNavLinks = (planCode: string, policyId: string, t: TFunction): NestedSubLink[] => [
    {
        text: t('site.navLinks.policySearch.altText'),
        href: t('site.navLinks.policySearch.link') || '',
        startIcon: <ShieldIcon key="policy-link" />,
        parentKey: ParentKeys.Policy,
        subLinks: [
            {
                text: t('site.navLinks.policyDetails.text'),
                href: t('site.navLinks.policyDetails.link', { id: policyId, planCode }) || '',
            },
            {
                text: t('site.navLinks.coverage.text'),
                href: t('site.navLinks.coverage.link', { id: policyId, planCode }) || '',
            },
            {
                text: t('site.navLinks.policyExtras.text'),
                href: t('site.navLinks.policyExtras.link', { id: policyId, planCode }) || '',
            },
            {
                text: t('site.navLinks.funds.text'),
                href: t('site.navLinks.funds.link', { id: policyId, planCode }) || '',
            },
        ],
    },
    {
        text: t('site.navLinks.people.text'),
        href: t('site.navLinks.people.link', { id: policyId, planCode }) || '',
        startIcon: <UserCircleIcon key="table" />,
        parentKey: ParentKeys.People,
    },
    {
        text: t('site.navLinks.transactions.text'),
        href: t('site.navLinks.transactions.link', { id: policyId, planCode }) || '',
        startIcon: <TransactionsIcon key="transactions-icon" />,
        parentKey: ParentKeys.Transactions,
        subLinks: [
            {
                text: t('site.navLinks.transactions.premiums.text'),
                href: t('site.navLinks.transactions.premiums.href', { id: policyId, planCode }) || '',
            },
            {
                text: t('site.navLinks.transactions.loans.text'),
                href: t('site.navLinks.transactions.loans.href', { id: policyId, planCode }) || '',
            },
            {
                text: t('site.navLinks.transactions.withdrawals.text'),
                href: t('site.navLinks.transactions.withdrawals.href', { id: policyId, planCode }) || '',
            },
        ],
    },
    {
        text: t('site.navLinks.history.text'),
        href: t('site.navLinks.history.link', { id: policyId, planCode }) || '',
        startIcon: <CalendarIcon key="history-icon" />,
        parentKey: ParentKeys.History,
    },
    {
        text: t('site.navLinks.documents.text'),
        href: t('site.navLinks.documents.link', { id: policyId, planCode }) || '',
        startIcon: <DocumentIcon key="documents-icon" />,
        parentKey: ParentKeys.Documents,
    },
];
