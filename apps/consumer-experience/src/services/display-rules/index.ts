import {
  PartyRole,
  Policy,
  PolicyStatus,
  ProductType,
} from '@xd/api-types/dist/generated-types/sor';

import { RouteKey } from '@/route-map';
import { logError, logTrace, logWarn } from '@/utils/logging/log-fns';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { isPayorOnly, partyRolesAreInAllowedList } from '@/utils/party';

import { ComponentName } from './types';
import { getLoggedInUserPolicyAndPartyData } from '../policy';
import { getLoggedInUserPolicyAndPartyDataErrors } from '../policy/types';

/**
 * Core function to evaluate component visibility rules
 *
 * These rules should follow product/role directed requirements.
 * Not UX/UI related requirements such as "only show this if there are X number of items in the array".
 */
export const evaluateComponentVisibilityRules = (
  policy: Policy,
  partyRoles: PartyRole[],
  skip?: boolean //An alternate skip option to override every option and force it to show
): Record<ComponentName, () => boolean> => {
  const isPayorNotOwner = isPayorOnly(partyRoles);
  // This means that we are defaulting to the owner view for any
  // role that is not explicitly set to be exclusive e.g. payor
  // this should be temporary, but this whole setup should be temporary
  // and ideally should be handled by CIAM
  const isNotPayor = !isPayorOnly(partyRoles);
  const isCancelled = policy.policyStatus === PolicyStatus.SURRENDERED;
  const isTerm = policy.product?.productType === ProductType.TERM;

  return {
    [ComponentName.OVERVIEW_PROFILE]: () => true,
    [ComponentName.OVERVIEW_PAYMENT_HISTORY]: () => isPayorNotOwner || !!skip,
    [ComponentName.OVERVIEW_PREMIUM_LINK]: () => true,
    [ComponentName.OVERVIEW_PREMIUM_DETAILED_VIEW]: () =>
      isPayorNotOwner || !!skip,
    [ComponentName.OVERVIEW_ACCOUNT_VALUE]: () =>
      (isNotPayor && !isTerm) || !!skip,
    [ComponentName.OVERVIEW_COVERAGE]: () => isNotPayor || !!skip,
    [ComponentName.OVERVIEW_BENEFICIARIES]: () => isNotPayor || !!skip,
    [ComponentName.OVERVIEW_RIDERS]: () => isNotPayor || !!skip,
    [ComponentName.OVERVIEW_DOCUMENTS]: () => isNotPayor || !!skip,
    [ComponentName.PROFILE_PAYOR_PARTY_ROLES]: () => isPayorNotOwner,
    [ComponentName.PREMIUM_PAYOR_BACK_URL]: () => isPayorNotOwner,
    [ComponentName.OTTP_PAYMENT_SUMMARY_ACCOUNT_VALUE]: () => !isTerm || !!skip,
    [ComponentName.NOTIFICATIONS]: () => isNotPayor || !!skip,
    [ComponentName.OVERVIEW_COVERAGE_CARD]: () => !isCancelled || !!skip,
    [ComponentName.OVERVIEW_ACCOUNT_VALUE_CARD]: () =>
      (!isCancelled && !isTerm) || !!skip,
    [ComponentName.SYSTEMATIC_PREMIUM_AUTOPAY_WITH_QUOTE_VALUES]: () =>
      isTerm || !!skip,
    [ComponentName.OTPP_EDITABLE_PAYMENT_AMOUNT]: () => !isTerm || !!skip,
  };
};

export const evaluateRouteRules = (
  policy: Policy,
  partyRoles: PartyRole[]
): Record<RouteKey, () => boolean> | null => {
  const isNotPayor = !isPayorOnly(partyRoles);
  const isCancelled = policy.policyStatus === PolicyStatus.SURRENDERED;

  const hasAcceptedRole = partyRolesAreInAllowedList(partyRoles);

  if (!hasAcceptedRole) {
    logWarn("User's roles were not in the included list of roles", {
      cause: { partyRoles },
    });
    throw new Error("User's roles were not in the included list of roles", {
      cause: { partyRoles },
    });
  }

  return {
    [RouteKey.ACCOUNT]: () =>
      isNotPayor &&
      policy.product?.productType !== ProductType.TERM &&
      !isCancelled,
    [RouteKey.ALLOCATIONS]: () => isNotPayor && !isCancelled,
    [RouteKey.BENEFICIARIES]: () => isNotPayor && !isCancelled,
    [RouteKey.BENEFICIARY]: () => isNotPayor && !isCancelled,
    [RouteKey.COVERAGE]: () => true,
    [RouteKey.DETAILS]: () => !isCancelled,
    [RouteKey.DOCUMENTS]: () => isNotPayor && !isCancelled,
    [RouteKey.HISTORY]: () => !isCancelled,
    [RouteKey.LOANS]: () => isNotPayor && !isCancelled,
    [RouteKey.MY_COVERAGE]: () => isNotPayor && !isCancelled,
    [RouteKey.NOTIFICATIONS]: () => isNotPayor && !isCancelled,
    [RouteKey.PREMIUM]: () => !isCancelled,
    [RouteKey.PREMIUM_DETAILS]: () => !isCancelled,
    [RouteKey.PREMIUM_HISTORY]: () => !isCancelled,
    [RouteKey.PROFILE]: () => !isCancelled,
    [RouteKey.RIDERS]: () => isNotPayor && !isCancelled,
    [RouteKey.SURRENDER]: () => isNotPayor && !isCancelled,
    [RouteKey.WITHDRAWALS]: () => isNotPayor && !isCancelled,
  };
};

/**
 * Get component visibility based on the policy and party roles
 */
export const getComponentVisibility = async (
  policyNumber: string,
  planCode: string
): Promise<Record<ComponentName, () => boolean> | null> => {
  try {
    const loggingContext = await buildCommonLogContext();

    logTrace('display-rules::start', {
      ...loggingContext,
      planCode,
      policyNumber,
    });

    const { data, error } = await getLoggedInUserPolicyAndPartyData(
      { planCode, policyNumber },
      loggingContext
    );

    // Evaluate all rules at once
    const visibility = evaluateComponentVisibilityRules(
      data?.policy ?? {},
      data?.partyRoles || [],
      error?.cause === getLoggedInUserPolicyAndPartyDataErrors.NO_PARTY_ID_FOUND
      // ^^^ Why are we doing this? Party Ref API had a situation where it wasnt returning a reference to a policy I had access to.
      // This short circuits the check and just returns true for everything in visibility
      // TODO: This might be a bad idea in the future if we have more separate components that cant all be displayed at once.
      // In that scenario, we might want to make it so that the check is done for each component separately.
      // https://se2llc-global.slack.com/archives/C08DTEEK0SZ/p1753979626786329
    );
    return visibility;
  } catch (error) {
    logError(
      '::getComponentVisibility::Error evaluating component visibility:',
      error
    );
    return null;
  }
};

/**
 *
 * Based on user role to a policy, return which routes should be accessible
 */
export const getRoutePermissions = async (
  policyNumber: string,
  planCode: string
): Promise<Record<RouteKey, () => boolean> | null> => {
  try {
    const loggingContext = await buildCommonLogContext();

    logTrace('getRoutePermissions::start', {
      ...loggingContext,
      planCode,
      policyNumber,
    });

    const { data } = await getLoggedInUserPolicyAndPartyData(
      { planCode, policyNumber },
      loggingContext
    );

    // Evaluate all rules at once
    const routePermissions = evaluateRouteRules(
      data?.policy ?? {},
      data?.partyRoles || []
    );
    return routePermissions;
  } catch (error) {
    logError(
      '::getRoutePermissions::Error evaluating component visibility:',
      error
    );
    return null;
  }
};
