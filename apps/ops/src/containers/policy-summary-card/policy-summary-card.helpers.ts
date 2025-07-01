import { TFunction } from 'next-i18next';

import { PolicyStatus } from '@deps/models/policy/sor-policy';
import { SearchViewQuery } from '@deps/types/search';

export const deathClaimNotApplicableStatuses: any[] = [
    PolicyStatus.CANCELEDNOPREMIUM,
    PolicyStatus.COMMUTED,
    PolicyStatus.NOTISSUED,
    PolicyStatus.SURRENDERED,
    PolicyStatus.DEATHCLAIMPAID,
    PolicyStatus.PENDINGISSUED,
    PolicyStatus.FREELOOKPER,
    PolicyStatus.CANCELEDFREELOOK,
    PolicyStatus.PNDOUTSTNDREQ,
    PolicyStatus.PNDAWAITFUNDS,
    PolicyStatus.REJECTED,
    PolicyStatus.TERMINATED,
    PolicyStatus.DEATHCLAIMPENDING,
    PolicyStatus.LIVINGCLAIMPENDING,
    PolicyStatus.PAYOUTPARTCLM,
];

export const deathClaimApplicableStatuses: any[] = [
    PolicyStatus.ACTIVE,
    PolicyStatus.HARDSHIP,
    PolicyStatus.MATURED,
    PolicyStatus.EXTENDEDFREEL,
    PolicyStatus.ACTIVEGUARANTEE,
    PolicyStatus.NONLIFEPAYOUT,
    PolicyStatus.RESTRICTION,
];

export const getCancelledPolicyStatuses = (
    policyStatus: string,
    t: TFunction
) => {
    switch (policyStatus) {
        case PolicyStatus.CANCELEDNOPREMIUM:
            return t(
                'dashboard.search.results.policySummaryCard.unableToProceedWithDeathClaimPolicyCancelled'
            );
        case PolicyStatus.COMMUTED:
            return t(
                'dashboard.search.results.policySummaryCard.unableToProceedWithDeathClaimPolicyCommuted'
            );
        case PolicyStatus.NOTISSUED:
            return t(
                'dashboard.search.results.policySummaryCard.unableToProceedWithDeathClaimPolicyAppEntry'
            );
        case PolicyStatus.SURRENDERED:
            return t(
                'dashboard.search.results.policySummaryCard.unableToProceedWithDeathClaimPolicyTerminated'
            );
        case PolicyStatus.DEATHCLAIMPAID:
            return t(
                'dashboard.search.results.policySummaryCard.unableToProceedWithDeathClaimPolicyDeathClaimPaid'
            );
        case PolicyStatus.PENDINGISSUED:
            return t(
                'dashboard.search.results.policySummaryCard.unableToProceedWithDeathClaimPolicyPendingOverIssue'
            );
        case PolicyStatus.FREELOOKPER:
            return t(
                'dashboard.search.results.policySummaryCard.unableToProceedWithDeathClaimPolicyFreeLookPeriod'
            );
        case PolicyStatus.CANCELEDFREELOOK:
            return t(
                'dashboard.search.results.policySummaryCard.unableToProceedWithDeathClaimPolicySurrender'
            );
        case PolicyStatus.PNDOUTSTNDREQ:
            return t(
                'dashboard.search.results.policySummaryCard.unableToProceedWithDeathClaimPolicyPendingRequirement'
            );
        case PolicyStatus.PNDAWAITFUNDS:
            return t(
                'dashboard.search.results.policySummaryCard.unableToProceedWithDeathClaimPolicyPendingFunds'
            );
        case PolicyStatus.REJECTED:
            return t(
                'dashboard.search.results.policySummaryCard.unableToProceedWithDeathClaimPolicyRejected'
            );
        case PolicyStatus.TERMINATED:
            return t(
                'dashboard.search.results.policySummaryCard.unableToProceedWithDeathClaimPolicyWithdrawn'
            );
        default:
            return t(
                'dashboard.search.results.policySummaryCard.deathClaimNotApplicable'
            );
    }
};

export const getPolicyHighlighter = ({
    firstName,
    lastName,
    policyNumber,
    ssn,
}: SearchViewQuery) => {
    if (!firstName && !lastName && !policyNumber && !ssn) return [];

    const descriptionListHighlighter = [];

    if (firstName) {
        descriptionListHighlighter.push(firstName.trim());
    }
    if (lastName) {
        descriptionListHighlighter.push(lastName.trim());
    }
    if (ssn) {
        descriptionListHighlighter.push(`***-**-${ssn.slice(-4)}`);
    }
    if (policyNumber) {
        descriptionListHighlighter.push(policyNumber);
    }

    return descriptionListHighlighter;
};
