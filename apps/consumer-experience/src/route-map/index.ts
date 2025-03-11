import { Index, LineOfBusinessPath, ROOT_URL_PATH } from '@/types';

export interface RouteMap {
  source: string;
  destination: string;
  title: string;
}

export enum RouteKey {
  ACCOUNT = '/account',
  ALLOCATIONS = '/allocations',
  BENEFICIARIES = '/beneficiaries',
  BENEFICIARY = '/beneficiary',
  COVERAGE = '/coverage',
  DETAILS = '/details',
  DOCUMENTS = '/documents',
  HISTORY = '/history',
  LOANS = '/loans',
  MY_COVERAGE = '/my-coverage',
  NOTIFICATIONS = '/notifications',
  PREMIUM = '/premium',
  PREMIUM_DETAILS = '/premium-details',
  PREMIUM_HISTORY = '/premium-history',
  PROFILE = '/profile',
  RIDERS = '/riders',
  SURRENDER = '/surrender',
  WITHDRAWALS = '/withdrawals',
}

const annuityPageTitles: Partial<Record<RouteKey, string>> = {
  [RouteKey.RIDERS]: 'Riders and Extras',
  [RouteKey.SURRENDER]: 'Surrender Contract',
};

export const routeMap: Record<RouteKey, RouteMap> = {
  [RouteKey.ACCOUNT]: {
    destination: '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/account',
    source: '/account',
    title: 'Account Value',
  },
  [RouteKey.ALLOCATIONS]: {
    destination:
      '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/account/allocations',
    source: '/allocations',
    title: 'Allocations',
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
  [RouteKey.COVERAGE]: {
    destination: ROOT_URL_PATH,
    source: ROOT_URL_PATH,
    title: 'My Coverage',
  },
  [RouteKey.DETAILS]: {
    destination:
      '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/premium/details',
    source: '/premium/details',
    title: 'Payment Details',
  },
  [RouteKey.DOCUMENTS]: {
    destination:
      '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/documents',
    source: '/documents',
    title: 'Documents',
  },
  [RouteKey.HISTORY]: {
    destination:
      '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/premium/history',
    source: '/premium/history',
    title: 'Premium History',
  },
  [RouteKey.LOANS]: {
    destination:
      '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/account/loans',
    source: '/loans',
    title: 'Loans',
  },
  [RouteKey.MY_COVERAGE]: {
    destination:
      '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/my-coverage',
    source: '/my-coverage',
    title: 'Coverage',
  },
  [RouteKey.NOTIFICATIONS]: {
    destination:
      '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/notifications',
    source: '/notifications',
    title: 'Notifications',
  },
  [RouteKey.PREMIUM]: {
    destination: '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/premium',
    source: '/premium',
    title: 'Premium payments',
  },
  [RouteKey.PREMIUM_DETAILS]: {
    destination:
      '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/premium/details',
    source: '/premium-details',
    title: 'Payment Details',
  },
  [RouteKey.PREMIUM_HISTORY]: {
    destination:
      '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/premium/history',
    source: '/history',
    title: 'Premium History',
  },
  [RouteKey.PROFILE]: {
    destination: '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/profile',
    source: '/profile',
    title: 'Owner Profile',
  },
  [RouteKey.RIDERS]: {
    destination: '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/riders',
    source: '/riders',
    title: 'Riders',
  },
  [RouteKey.SURRENDER]: {
    destination:
      '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/account/surrender',
    source: '/surrender',
    title: 'Surrender Policy',
  },
  [RouteKey.WITHDRAWALS]: {
    destination:
      '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/account/withdrawals',
    source: '/withdrawals',
    title: 'Withdrawals',
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

export const getPageTitle = (
  key: RouteKey,
  lineOfBusiness?: LineOfBusinessPath
) => {
  if (
    lineOfBusiness === LineOfBusinessPath.ANNUITIES &&
    annuityPageTitles[key]
  ) {
    return annuityPageTitles[key];
  }

  return routeMap[key]?.title ?? '';
};
