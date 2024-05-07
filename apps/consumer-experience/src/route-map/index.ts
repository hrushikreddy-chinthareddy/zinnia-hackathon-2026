import { Index } from '@/types';

export interface RouteMap {
  source: string;
  destination: string;
  title: string;
}
export enum RouteKey {
  RIDERS = '/riders',
  PREMIUM = '/premium',
  PROFILE = '/profile',
  DOCUMENTS = '/documents',
  COVERAGE = '/coverage',
  ACCOUNT = '/account',
  PREMIUM_HISTORY = '/premium-history',
  HISTORY = '/history',
  PREMIUM_DETAILS = '/premium-details',
  DETAILS = '/details',
  BENEFICIARIES = '/beneficiaries',
  BENEFICIARY = '/beneficiary',
  WITHDRAWALS = '/withdrawals',
  SURRENDER = '/surrender',
  LOANS = '/loans',
  FUNDS = '/funds',
  POLICIES = '/policies',
}

export const routeMap: Index<RouteMap> = {
  [RouteKey.RIDERS]: {
    destination: '/policies/[planCode]/[policyNumber]/riders',
    source: '/riders',
    title: 'Riders',
  },
  [RouteKey.PREMIUM]: {
    destination: '/policies/[planCode]/[policyNumber]/premium',
    source: '/premium',
    title: 'Premium payments',
  },
  [RouteKey.PROFILE]: {
    destination: '/policies/[planCode]/[policyNumber]/profile',
    source: '/profile',
    title: 'Profile',
  },
  [RouteKey.DOCUMENTS]: {
    destination: '/policies/[planCode]/[policyNumber]/documents',
    source: '/documents',
    title: 'Documents',
  },
  [RouteKey.COVERAGE]: {
    destination: '/policies/[planCode]/[policyNumber]/coverage',
    source: '/coverage',
    title: 'Increase coveragte',
  },
  [RouteKey.ACCOUNT]: {
    destination: '/policies/[planCode]/[policyNumber]/account',
    source: '/account',
    title: 'Account value',
  },
  [RouteKey.PREMIUM_HISTORY]: {
    destination: '/policies/[planCode]/[policyNumber]/premium/history',
    source: '/history',
    title: 'Premium history',
  },
  [RouteKey.HISTORY]: {
    destination: '/policies/[planCode]/[policyNumber]/premium/history',
    source: '/premium/history',
    title: 'Premium history',
  },
  [RouteKey.PREMIUM_DETAILS]: {
    destination: '/policies/[planCode]/[policyNumber]/premium/details',
    source: '/premium-details',
    title: 'Payment details',
  },
  [RouteKey.DETAILS]: {
    destination: '/policies/[planCode]/[policyNumber]/premium/details',
    source: '/premium/details',
    title: 'Payment details',
  },
  [RouteKey.BENEFICIARIES]: {
    destination: '/policies/[planCode]/[policyNumber]/beneficiaries',
    source: '/beneficiaries',
    title: 'Beneficiaries',
  },
  [RouteKey.BENEFICIARY]: {
    destination:
      '/policies/[planCode]/[policyNumber]/beneficiaries/[beneficiary]',
    source: '/beneficiary',
    title: 'Beneficiary',
  },
  [RouteKey.WITHDRAWALS]: {
    destination: '/policies/[planCode]/[policyNumber]/account/withdrawals',
    source: '/withdrawals',
    title: 'Withdrawals',
  },
  [RouteKey.SURRENDER]: {
    destination: '/policies/[planCode]/[policyNumber]/account/surrender',
    source: '/surrender',
    title: 'Surrender Policy',
  },
  [RouteKey.LOANS]: {
    destination: '/policies/[planCode]/[policyNumber]/account/loans',
    source: '/loans',
    title: 'Loans',
  },
  [RouteKey.FUNDS]: {
    destination: '/policies/[planCode]/[policyNumber]/account/funds',
    source: '/funds',
    title: 'Funds',
  },
  [RouteKey.POLICIES]: {
    destination: '/policies',
    source: '/policies',
    title: 'My Policies',
  },
};

export const getRedirectUrl = (
  redirect: RouteMap,
  replaceMents: Index<string>
) => {
  let result = redirect.destination;
  Object.keys(replaceMents).forEach(key => {
    const regex = new RegExp(`\\[${key}\\]`, 'g'); // Use regex to match [key] format
    result = result.replace(regex, replaceMents[key] || '');
  });
  return result;
};

export const getPageTitle = (key: RouteKey) => {
  return routeMap[key]?.title ?? '';
};
