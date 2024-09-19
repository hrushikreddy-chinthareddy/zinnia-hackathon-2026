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
  COVERAGE = '/my-coverage',
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
  ALLOCATIONS = '/allocations',
  ALL_COVERAGE = '/coverage',
}

export const routeMap: Index<RouteMap> = {
  [RouteKey.RIDERS]: {
    destination: '/coverage/[productType]/[planCode]/[policyNumber]/riders',
    source: '/riders',
    title: 'Riders',
  },
  [RouteKey.PREMIUM]: {
    destination: '/coverage/[productType]/[planCode]/[policyNumber]/premium',
    source: '/premium',
    title: 'Premium payments',
  },
  [RouteKey.PROFILE]: {
    destination: '/coverage/[productType]/[planCode]/[policyNumber]/profile',
    source: '/profile',
    title: 'Policy Profile',
  },
  [RouteKey.DOCUMENTS]: {
    destination: '/coverage/[productType]/[planCode]/[policyNumber]/documents',
    source: '/documents',
    title: 'Documents',
  },
  [RouteKey.COVERAGE]: {
    destination: '/coverage/[productType]/[planCode]/[policyNumber]/coverage',
    source: '/my-coverage',
    title: 'Coverage',
  },
  [RouteKey.ACCOUNT]: {
    destination: '/coverage/[productType]/[planCode]/[policyNumber]/account',
    source: '/account',
    title: 'Account value',
  },
  [RouteKey.PREMIUM_HISTORY]: {
    destination:
      '/coverage/[productType]/[planCode]/[policyNumber]/premium/history',
    source: '/history',
    title: 'Premium history',
  },
  [RouteKey.HISTORY]: {
    destination:
      '/coverage/[productType]/[planCode]/[policyNumber]/premium/history',
    source: '/premium/history',
    title: 'Premium history',
  },
  [RouteKey.PREMIUM_DETAILS]: {
    destination:
      '/coverage/[productType]/[planCode]/[policyNumber]/premium/details',
    source: '/premium-details',
    title: 'Payment details',
  },
  [RouteKey.DETAILS]: {
    destination:
      '/coverage/[productType]/[planCode]/[policyNumber]/premium/details',
    source: '/premium/details',
    title: 'Payment details',
  },
  [RouteKey.BENEFICIARIES]: {
    destination:
      '/coverage/[productType]/[planCode]/[policyNumber]/beneficiaries',
    source: '/beneficiaries',
    title: 'Beneficiaries',
  },
  [RouteKey.BENEFICIARY]: {
    destination:
      '/coverage/[productType]/[planCode]/[policyNumber]/beneficiaries/[beneficiary]',
    source: '/beneficiary',
    title: 'Beneficiary',
  },
  [RouteKey.WITHDRAWALS]: {
    destination:
      '/coverage/[productType]/[planCode]/[policyNumber]/account/withdrawals',
    source: '/withdrawals',
    title: 'Withdrawals',
  },
  [RouteKey.SURRENDER]: {
    destination:
      '/coverage/[productType]/[planCode]/[policyNumber]/account/surrender',
    source: '/surrender',
    title: 'Surrender Policy',
  },
  [RouteKey.LOANS]: {
    destination:
      '/coverage/[productType]/[planCode]/[policyNumber]/account/loans',
    source: '/loans',
    title: 'Loans',
  },
  [RouteKey.ALLOCATIONS]: {
    destination:
      '/coverage/[productType]/[planCode]/[policyNumber]/account/allocations',
    source: '/allocations',
    title: 'Allocations',
  },
  [RouteKey.ALL_COVERAGE]: {
    destination: '/coverage',
    source: '/coverage',
    title: 'My Coverage',
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
