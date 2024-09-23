import { Index, ROOT_URL_PATH } from '@/types';

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
  MY_COVERAGE = '/my-coverage',
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
  COVERAGE = '/coverage',
}

export const routeMap: Index<RouteMap> = {
  [RouteKey.RIDERS]: {
    destination: '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/riders',
    source: '/riders',
    title: 'Riders',
  },
  [RouteKey.PREMIUM]: {
    destination: '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/premium',
    source: '/premium',
    title: 'Premium payments',
  },
  [RouteKey.PROFILE]: {
    destination: '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/profile',
    source: '/profile',
    title: 'Owner Profile',
  },
  [RouteKey.DOCUMENTS]: {
    destination:
      '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/documents',
    source: '/documents',
    title: 'Documents',
  },
  [RouteKey.MY_COVERAGE]: {
    destination:
      '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/my-coverage',
    source: '/my-coverage',
    title: 'Coverage',
  },
  [RouteKey.ACCOUNT]: {
    destination: '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/account',
    source: '/account',
    title: 'Account value',
  },
  [RouteKey.PREMIUM_HISTORY]: {
    destination:
      '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/premium/history',
    source: '/history',
    title: 'Premium history',
  },
  [RouteKey.HISTORY]: {
    destination:
      '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/premium/history',
    source: '/premium/history',
    title: 'Premium history',
  },
  [RouteKey.PREMIUM_DETAILS]: {
    destination:
      '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/premium/details',
    source: '/premium-details',
    title: 'Payment details',
  },
  [RouteKey.DETAILS]: {
    destination:
      '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/premium/details',
    source: '/premium/details',
    title: 'Payment details',
  },
  [RouteKey.BENEFICIARIES]: {
    destination:
      '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/beneficiaries',
    source: '/beneficiaries',
    title: 'Beneficiaries',
  },
  [RouteKey.BENEFICIARY]: {
    destination:
      '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/beneficiaries/[beneficiary]',
    source: '/beneficiary',
    title: 'Beneficiary',
  },
  [RouteKey.WITHDRAWALS]: {
    destination:
      '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/account/withdrawals',
    source: '/withdrawals',
    title: 'Withdrawals',
  },
  [RouteKey.SURRENDER]: {
    destination:
      '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/account/surrender',
    source: '/surrender',
    title: 'Surrender Policy',
  },
  [RouteKey.LOANS]: {
    destination:
      '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/account/loans',
    source: '/loans',
    title: 'Loans',
  },
  [RouteKey.ALLOCATIONS]: {
    destination:
      '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/account/allocations',
    source: '/allocations',
    title: 'Allocations',
  },
  [RouteKey.COVERAGE]: {
    destination: ROOT_URL_PATH,
    source: ROOT_URL_PATH,
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
