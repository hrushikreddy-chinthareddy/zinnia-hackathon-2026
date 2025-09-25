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

// TODO: Is there a reason that we need source as a property if the value
// always matches the RouteKey?
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
    title: 'My Profile',
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
  // @TODO CUI-1070: This is moved for now until route restrictions for subroutes under /my-coverage are fixed
  [RouteKey.MY_COVERAGE]: {
    destination:
      '/coverage/[lineOfBusiness]/[planCode]/[policyNumber]/my-coverage',
    source: '/my-coverage',
    title: 'Coverage',
  },
};

/**
 * Returns the key of the first route in routeMap whose source is included in the given path.
 * If no route matches, returns undefined.
 *
 * @param {string} path - The path to search for a matching route.
 * @return {RouteKey | undefined} The key of the first matching route, or undefined.
 */
export const getRouteKeyFromUrl = (path: string) => {
  return Object.entries(routeMap).find(([, { source }]) => {
    return path.includes(source);
  })?.[0];
};

export const getRedirectUrl = (
  redirect: RouteMap,
  replaceMents: Index<string>
) => {
  let result = redirect?.destination;

  if (!result) {
    return '';
  }

  Object.keys(replaceMents).forEach(key => {
    const regex = new RegExp(`\\[${key}\\]`, 'g'); // Use regex to match [key] format
    result = result.replace(regex, (key && replaceMents[key]) || '');
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
