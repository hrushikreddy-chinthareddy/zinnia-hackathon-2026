import { Index } from '@/types';

export interface Redirect {
  source: string;
  destination: string;
}

export const redirects: Index<Redirect> = {
  '/riders': {
    destination: '/policies/[planCode]/[policyNumber]/riders',
    source: '/riders',
  },
  '/premium': {
    destination: '/policies/[planCode]/[policyNumber]/premium',
    source: '/premium',
  },
  '/profile': {
    destination: '/policies/[planCode]/[policyNumber]/profile',
    source: '/profile',
  },
  '/documents': {
    destination: '/policies/[planCode]/[policyNumber]/documents',
    source: '/documents',
  },
  '/coverage': {
    destination: '/policies/[planCode]/[policyNumber]/coverage',
    source: '/coverage',
  },
  '/account': {
    destination: '/policies/[planCode]/[policyNumber]/account',
    source: '/account',
  },
  '/premium-history': {
    destination: '/policies/[planCode]/[policyNumber]/premium/history',
    source: '/history',
  },
  '/premium-details': {
    destination: '/policies/[planCode]/[policyNumber]/premium/details',
    source: '/premium-details',
  },
  '/beneficiaries': {
    destination: '/policies/[planCode]/[policyNumber]/beneficiaries',
    source: '/beneficiaries',
  },
  '/withdrawals': {
    destination: '/policies/[planCode]/[policyNumber]/account/withdrawals',
    source: '/withdrawals',
  },
  '/surrender': {
    destination: '/policies/[planCode]/[policyNumber]/account/surrender',
    source: '/surrender',
  },
  '/loans': {
    destination: '/policies/[planCode]/[policyNumber]/account/loans',
    source: '/loans',
  },
  '/funds': {
    destination: '/policies/[planCode]/[policyNumber]/account/funds',
    source: '/funds',
  },
};

export const getRedirectUrl = (
  redirect: Redirect,
  replaceMents: Index<string>
) => {
  let result = redirect.destination;
  Object.keys(replaceMents).forEach(key => {
    const regex = new RegExp(`\\[${key}\\]`, 'g'); // Use regex to match [key] format
    result = result.replace(regex, replaceMents[key] || '');
  });
  return result;
};
