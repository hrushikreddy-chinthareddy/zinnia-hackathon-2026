import { TFunction } from 'i18next';

import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';

import { getPolicyVisibility } from '@deps/helpers/policy-visibility/policy-visibility-helper';

import { QuickLinksProps } from './quick-links';


export const getPolicyQuickLinks = async (t: TFunction, policy: PolicyDetails): Promise<QuickLinksProps['links']> => {
    const { policyNumber, planCode, isAnnuity } = policy;
    const { showFundsAndAccounts, showLoans, showWithdrawals, detailLinkType } = await getPolicyVisibility(policy);

    return [
        {
            href: t('site.navLinks.policyDetails.link', { id: policyNumber, planCode }),
            name: t(policy.isLife ? 'site.navLinks.policyDetails.altText' : 'site.navLinks.contractDetails.altText'),
            hideLabel: true,
            subLinks: [
                {
                    name: t(`site.navLinks.${detailLinkType}.text`),
                    href: t(`site.navLinks.${detailLinkType}.link`, { id: policyNumber, planCode }) || '',
                },
                ...(!isAnnuity
                    ? [
                          {
                              name: t('site.navLinks.coverage.text'),
                              href: t('site.navLinks.coverage.link', { id: policyNumber, planCode }) || '',
                          },
                      ]
                    : []),
                {
                    name: t(`site.navLinks.ridersAndFeatures.text`),
                    href: t(`site.navLinks.ridersAndFeatures.link`, { id: policyNumber, planCode }) || '',
                },
                ...(showFundsAndAccounts
                    ? [
                          {
                            name: t('site.navLinks.funds.text'),
                            href: t('site.navLinks.funds.link', { id: policyNumber, planCode }) || '',
                        },
                      ]
                    : []),
                
                {
                    name: t('site.navLinks.transactions.premiums.text'),
                    href: t('site.navLinks.transactions.premiums.href', { id: policyNumber, planCode }) || '',
                },
                ...(showLoans
                    ? [
                          {
                            name: t('site.navLinks.transactions.loans.text'),
                            href: t('site.navLinks.transactions.loans.href', { id: policyNumber, planCode }) || '',
                        },
                      ]
                    : []),
                
                ...(showWithdrawals
                    ? [
                          {
                            name: t('site.navLinks.transactions.withdrawals.text'),
                            href: t('site.navLinks.transactions.withdrawals.href', { id: policyNumber, planCode }) || '',
                        },
                      ]
                    : []),
                
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
            hideLabel: true,
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
