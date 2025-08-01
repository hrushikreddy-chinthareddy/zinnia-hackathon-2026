import {
  PartyRole,
  Policy,
  ProductType,
} from '@xd/api-types/dist/generated-types/sor';
import * as jose from 'jose';

import { UserClaims } from '@/types/auth';
import { getAccessToken } from '@/utils/auth';
import { logError, logTrace } from '@/utils/logging/log-fns';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { isPayorOnly } from '@/utils/party';

import { ComponentName } from './types';
import { getPartyReferenceData } from '../party-reference';
import {
  getPartyRolesByPolicyNumber,
  getPolicyPartyIdByPolicyNumber,
} from '../party-reference/transformers';
import { getPolicyByPlanCodeAndId } from '../policy';
import { getPartyRolesFromPolicyPartyId } from '../policy/transformers';

/**
 * Core function to evaluate component visibility rules
 *
 * These rules should follow product/role directed requirements.
 * Not UX/UI related requirements such as "only show this if there are X number of items in the array".
 */
export const evaluateRules = (
  policy: Policy,
  partyRoles: PartyRole[]
): Record<ComponentName, () => boolean> => {
  const isPayorNotOwner = isPayorOnly(partyRoles);
  // This means that we are defaulting to the owner view for any
  // role that is not explicitly set to be exclusive e.g. payor
  // this should be temporary, but this whole setup should be temporary
  // and ideally should be handled by CIAM
  const isNotPayor = !isPayorOnly(partyRoles);

  // Evaluate all rules at once
  return {
    [ComponentName.OWNER_PROFILE]: () => isNotPayor,
    [ComponentName.PAYOR_PROFILE]: () => isPayorNotOwner,
    [ComponentName.OVERVIEW_PAYMENT_HISTORY]: () => isPayorNotOwner,
    [ComponentName.OVERVIEW_PREMIUM_LINK]: () => isNotPayor || isPayorNotOwner,
    [ComponentName.OVERVIEW_PREMIUM_DETAILED_VIEW]: () => isPayorNotOwner,
    [ComponentName.OVERVIEW_ACCOUNT_VALUE]: () =>
      isNotPayor && policy.product?.productType !== ProductType.TERM,
    [ComponentName.OVERVIEW_COVERAGE]: () => isNotPayor,
    [ComponentName.OVERVIEW_BENEFICIARIES]: () => isNotPayor,
    [ComponentName.OVERVIEW_RIDERS]: () => isNotPayor,
    [ComponentName.OVERVIEW_DOCUMENTS]: () => isNotPayor,
  };
};

export const getComponentVisibility = async (
  policyNumber: string,
  planCode: string
): Promise<Record<ComponentName, () => boolean> | null> => {
  try {
    // Get the access token party ID
    const { accessToken } = await getAccessToken();

    if (!accessToken) {
      throw new Error('No accessToken found: getAccessToken');
    }

    let partyId;
    try {
      const decodedToken = jose.decodeJwt(accessToken) as UserClaims;
      partyId = decodedToken.partyId;
    } catch (tokenError) {
      throw new Error(`Error decoding JWT: ${tokenError}`);
    }

    const loggingContext = await buildCommonLogContext();

    logTrace('displa-rules::start', {
      ...loggingContext,
      planCode,
      policyNumber,
    });

    const [{ data: partyRefData }, { data: policyData }] = await Promise.all([
      getPartyReferenceData(partyId, loggingContext),
      getPolicyByPlanCodeAndId(
        {
          planCode,
          policyNumber,
        },
        loggingContext
      ),
    ]);

    if (!partyRefData) {
      throw new Error('No party reference data found: getPartyReferenceData');
    }

    // try to get partyRoles from the party reference API
    let partyRoles = getPartyRolesByPolicyNumber(partyRefData, policyNumber);

    // if no roles come back, we need to cross reference the partyId from party reference with the policy partyRoles
    if (!partyRoles) {
      const policyPartyId = getPolicyPartyIdByPolicyNumber(
        partyRefData,
        policyNumber
      );

      if (!policyData) {
        throw new Error('No policy found: getPolicyPartyIdByPolicyNumber');
      }
      partyRoles = getPartyRolesFromPolicyPartyId(policyPartyId, policyData);
    }

    if (!policyData) {
      throw new Error('No party roles found: getPartyRolesFromPolicyPartyId');
    }

    // Evaluate all rules at once
    const visibility = evaluateRules(policyData, partyRoles);
    return visibility;
  } catch (error) {
    logError(
      '::getComponentVisibility::Error evaluating component visibility:',
      error
    );
    return null;
  }
};
