import { TFunction } from 'next-i18next';

import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { ReactComponent as CalendarIcon } from '@deps/styles/elements/icons/icons_outlined/calendar.svg';
import { ReactComponent as DocumentIcon } from '@deps/styles/elements/icons/icons_outlined/document-text-2.svg';
import { ReactComponent as ShieldIcon } from '@deps/styles/elements/icons/icons_outlined/shield-magnify.svg';
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

export const getNavLinks = (policy: PolicyDetails, t: TFunction): NestedSubLink[] => {
    const { policyNumber, planCode, isAnnuity } = policy;

    return [
        {
            text: isAnnuity ? t('site.navLinks.contractDetails.altText') : t('site.navLinks.policySearch.altText'),
            href: t('site.navLinks.policySearch.link') || '',
            startIcon: <ShieldIcon key="policy-link" />,
            parentKey: ParentKeys.Policy,
            subLinks: [
                {
                    text: t(`site.navLinks.${isAnnuity ? 'contractDetails' : 'policyDetails'}.text`),
                    href: t(`site.navLinks.${isAnnuity ? 'contractDetails' : 'policyDetails'}.link`, { id: policyNumber, planCode }) || '',
                },
                {
                    text: t('site.navLinks.coverage.text'),
                    href: t('site.navLinks.coverage.link', { id: policyNumber, planCode }) || '',
                },
                {
                    text: t(`site.navLinks.${isAnnuity ? 'contractExtras' : 'policyExtras'}.text`),
                    href: t(`site.navLinks.${isAnnuity ? 'contractExtras' : 'policyExtras'}.link`, { id: policyNumber, planCode }) || '',
                },
                {
                    text: t('site.navLinks.funds.text'),
                    href: t('site.navLinks.funds.link', { id: policyNumber, planCode }) || '',
                },
                {
                    text: t('site.navLinks.transactions.premiums.text'),
                    href: t('site.navLinks.transactions.premiums.href', { id: policyNumber, planCode }) || '',
                },
                {
                    text: t('site.navLinks.transactions.loans.text'),
                    href: t('site.navLinks.transactions.loans.href', { id: policyNumber, planCode }) || '',
                },
                {
                    text: t('site.navLinks.transactions.withdrawals.text'),
                    href: t('site.navLinks.transactions.withdrawals.href', { id: policyNumber, planCode }) || '',
                },
                ...(isAnnuity
                    ? [
                          {
                              text: t('site.navLinks.annuitization.text'),
                              href: t('site.navLinks.annuitization.href', { id: policyNumber, planCode }) || '',
                          },
                      ]
                    : []),
            ],
        },
        {
            text: t('site.navLinks.people.text'),
            href: t('site.navLinks.people.link', { id: policyNumber, planCode }) || '',
            startIcon: <UserCircleIcon key="table" />,
            parentKey: ParentKeys.People,
        },
        {
            text: t('site.navLinks.activity.text'),
            href: t('site.navLinks.activity.link', { id: policyNumber, planCode }) || '',
            startIcon: <CalendarIcon key="history-icon" />,
            parentKey: ParentKeys.Activity,
        },
        {
            text: t('site.navLinks.documents.text'),
            href: t('site.navLinks.documents.link', { id: policyNumber, planCode }) || '',
            startIcon: <DocumentIcon key="documents-icon" />,
            parentKey: ParentKeys.Documents,
        },
    ];
};

export const getReRegNavLinks = (clientId: string, policyId: string, t: TFunction): NestedSubLink[] => [
    {
        text: t('site.navLinks.people.text'),
        href: `re-reg?policyNumber=${policyId}&clientId=${clientId}` || '',
        startIcon: <UserCircleIcon key="table" />,
        parentKey: ParentKeys.People,
    },
];
