import '@deps/styles/styles.css';
import { Meta } from '@storybook/react';
import { useTranslation } from 'next-18next';

import { ParentKeys } from '@deps/config/nav.config';
import { StaticNestedNavDrawerProvider } from '@deps/contexts/LayoutContexts/StaticNestedNavDrawerContext';
import { ReactComponent as CalendarIcon } from '@deps/styles/elements/icons/icons_outlined/calendar.svg';
import { ReactComponent as DocumentIcon } from '@deps/styles/elements/icons/icons_outlined/document-text-2.svg';
import { ReactComponent as ShieldIcon } from '@deps/styles/elements/icons/icons_outlined/shield-magnify.svg';
import { ReactComponent as UserCircleIcon } from '@deps/styles/elements/icons/icons_outlined/user-circle.svg';

import NestedNavDrawer from './nested-nav-drawer';

const meta: Meta<typeof NestedNavDrawer> = {
    title: 'Components/NestedNavDrawer',
    component: NestedNavDrawer,
    args: {
        navLinks: [],
    },
};

export default meta;

export const Default = () => {
    const { t } = useTranslation();
    const isAnnuity = false;
    const policyNumber = 'testId';
    const planCode = 'SBFIXUL1';

    const navLinks = [
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
            ],
        },
        {
            text: t('site.navLinks.people.text'),
            href: t('site.navLinks.people.link', { id: policyNumber, planCode }) || '',
            startIcon: <UserCircleIcon key="table" />,
            parentKey: ParentKeys.People,
        },
        {
            text: t('site.navLinks.history.text'),
            href: t('site.navLinks.history.link', { id: policyNumber, planCode }) || '',
            startIcon: <CalendarIcon key="history-icon" />,
            parentKey: ParentKeys.History,
        },
        {
            text: t('site.navLinks.documents.text'),
            href: t('site.navLinks.documents.link', { id: policyNumber, planCode }) || '',
            startIcon: <DocumentIcon key="documents-icon" />,
            parentKey: ParentKeys.Documents,
        },
    ];
    return (
        <StaticNestedNavDrawerProvider>
            <NestedNavDrawer navLinks={navLinks} />
        </StaticNestedNavDrawerProvider>
    );
};

Default.parameters = {
    nextjs: {
        router: {
            pathname: '/policies/SBFIXUL1/testId/policy/coverage',
            asPath: '/policies/SBFIXUL1/testId/policy/coverage',
        },
    },
};
