import { TFunction } from 'i18next';

import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';

import { QuickLinksProps } from './quick-links';

export const getPolicyQuickLinks = (t: TFunction, policy: PolicyDetails): QuickLinksProps['links'] => {
    const { policyNumber, planCode, isAnnuity } = policy;

    return [
        {
            href: t('site.navLinks.policyDetails.link', { id: policyNumber, planCode }),
            name: t(policy.isLife ? 'site.navLinks.policyDetails.altText' : 'site.navLinks.contractDetails.altText'),
            subLinks: [
                {
                    name: t(`site.navLinks.${isAnnuity ? 'contractDetails' : 'policyDetails'}.text`),
                    href: t(`site.navLinks.${isAnnuity ? 'contractDetails' : 'policyDetails'}.link`, { id: policyNumber, planCode }) || '',
                },
                {
                    name: t('site.navLinks.coverage.text'),
                    href: t('site.navLinks.coverage.link', { id: policyNumber, planCode }) || '',
                },
                {
                    name: t(`site.navLinks.${isAnnuity ? 'contractExtras' : 'policyExtras'}.text`),
                    href: t(`site.navLinks.${isAnnuity ? 'contractExtras' : 'policyExtras'}.link`, { id: policyNumber, planCode }) || '',
                },
                {
                    name: t('site.navLinks.funds.text'),
                    href: t('site.navLinks.funds.link', { id: policyNumber, planCode }) || '',
                },
                {
                    name: t('site.navLinks.transactions.premiums.text'),
                    href: t('site.navLinks.transactions.premiums.href', { id: policyNumber, planCode }) || '',
                },
                {
                    name: t('site.navLinks.transactions.loans.text'),
                    href: t('site.navLinks.transactions.loans.href', { id: policyNumber, planCode }) || '',
                },
                {
                    name: t('site.navLinks.transactions.withdrawals.text'),
                    href: t('site.navLinks.transactions.withdrawals.href', { id: policyNumber, planCode }) || '',
                },
                ...(isAnnuity
                    ? [
                          {
                              name: t('site.navLinks.annuitization.text'),
                              href: t('site.navLinks.annuitization.href', { id: policyNumber, planCode }) || '',
                          },
                      ]
                    : []),
            ],
        },
        {
            href: t('site.navLinks.people.link', { id: policyNumber, planCode }),
            name: t('site.navLinks.people.text'),
        },
        {
            href: t('site.navLinks.history.link', { id: policyNumber, planCode }),
            name: t('pageHeader.activity.headerText'),
            subLinks: [
                {
                    name: t(`site.navLinks.activity.subLinks.transactions.text`),
                    href: t(`site.navLinks.activity.subLinks.transactions.link`, { id: policyNumber, planCode }),
                },
                {
                    name: t(`site.navLinks.activity.subLinks.callLogs.text`),
                    href: t(`site.navLinks.activity.subLinks.callLogs.link`, { id: policyNumber, planCode }),
                },
            ],
        },
        {
            href: t('site.navLinks.documents.link', { id: policyNumber, planCode }),
            name: t('site.navLinks.documents.text'),
        },
    ];
};
