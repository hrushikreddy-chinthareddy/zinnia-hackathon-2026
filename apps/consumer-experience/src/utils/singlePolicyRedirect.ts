import { RouteKey, routeMap, getRedirectUrl } from '@/route-map';
import { getMyPoliciesByCarrier } from '@/services';
import { lineOfBusinessUrlPath } from './data';
import { REDIRECT_TO_URL_KEY } from './serverClientUtils';
import { baseExperienceCarriers } from './carriers';

/**
 * If the user only has one policy, this will return that policy
 * otherwise return null.
 *
 * @returns {Policy | null} The user's policy
 */
export const userSinglePolicy = async () => {
  const { data: allPolicies } = await getMyPoliciesByCarrier(
    baseExperienceCarriers
  );

  return allPolicies && allPolicies.length === 1 ? allPolicies[0] : null;
};

/**
 * Check if the given `redirectTo` value is a valid redirect friendly url.
 * The check is done by looking for the `redirectTo` in the `routeMap`.
 * If it is present, the function returns true, otherwise false.
 * @param {string} redirectTo - The value to check.
 * @returns {boolean} If the value is a valid redirect friendly url.
 */
export const isRedirectAFriendlyUrl = (redirectTo: string) =>
  redirectTo && !!routeMap[redirectTo as RouteKey];

export const getFriendlyRedirectUrl = async ({
  redirectTo,
  policy,
}: {
  redirectTo?: string;
  policy?: any;
}) => {
  const friendlyUrlObj = redirectTo && routeMap[redirectTo as RouteKey];
  if (!friendlyUrlObj) {
    return `/coverage`;
  }

  if (policy && policy?.policyNumber && friendlyUrlObj) {
    return getRedirectUrl(friendlyUrlObj, {
      planCode: policy?.planCode || '',
      policyNumber: policy?.policyNumber || '',
      lineOfBusiness: lineOfBusinessUrlPath(policy?.lineOfBusiness),
    });
  }

  return `/coverage?${REDIRECT_TO_URL_KEY}=${redirectTo}`;
};
