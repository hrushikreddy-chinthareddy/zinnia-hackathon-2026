import { PaymentMethod } from '@/types/payment';
import { PolicyRequestInputs } from '@/types/policy';
import { parseAPIResponse } from '@/utils/api';
import { getSession } from '@/utils/auth';
import { logInfo } from '@/utils/logging/log-fns';
import { CommonLogContext } from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';

import { transformPaymentMethods } from './transformers';
import { aggregationBaseUrl } from '../api-config';
import { getFeatureFlags } from '../feature-flags';
import { getPartyReferenceData } from '../party-reference';
import { getPolicyPartyIdByPolicyNumber } from '../party-reference/transformers';
import { getPaymentDetails } from '../policy';
import { ServerApi } from '../server-http';

interface PaymentMethodParams {
  planCode: string;
  policyNumber: string;
  // This is the partyId that is associated with the user on the policy
  // for some carriers, this may match the partyId on auth, but not
  // for all.
  policyPartyId: string;
}

const FILE_NAME =
  'apps/consumer-experience/src/services/payment-methods/index.ts';

export const getUserPaymentMethods = withLogging(
  async (
    { planCode, policyNumber, policyPartyId }: PaymentMethodParams,
    loggingCtx: CommonLogContext
  ) => {
    const url = `${aggregationBaseUrl}/policies/${planCode}/${policyNumber}/paymentmethods?partyId=${policyPartyId}`;

    const rawResponse = await ServerApi.get(url, undefined, loggingCtx);
    const response = await parseAPIResponse(rawResponse);

    // TODO: according to the API spec, a 404 should be "no bank details found"
    // but we're getting a 404 returned with the error
    // message: 'Error occurred while calling paymentus client for fetching profile details list'
    // until we're aligned on the expected API returns, leaving 404 as
    // an error
    // if (rawResponse.status === 404) {
    //   logWarn('No payment methods found for user', {
    //     ...logApiNotOkDetails({ rawResponse, parsedResponse: response }),
    //     ...loggingCtx,
    //     planCode,
    //     policyNumber,
    //     policyPartyId,
    //   });

    //   return response;
    // }

    if (!rawResponse?.ok) {
      throw new Error('Error fetching payment methods.', {
        cause: { policyNumber, planCode },
      });
    }

    if (!response) {
      logInfo(
        'Call was successful, but payment details returned null or undefined',
        {
          ...loggingCtx,
          planCode,
          policyNumber,
        }
      );
    }

    return response;
  },
  { file: FILE_NAME, functionName: 'getUserPaymentMethods' }
);

export const getPaymentMethods = withLogging(
  async (
    params: PolicyRequestInputs,
    loggingContext: CommonLogContext
  ): Promise<PaymentMethod[]> => {
    const flags = await getFeatureFlags();
    // What this means is that we will be using the getPaymentDetails
    // call for all carriers (so paymentus will not longer be called on farmers policies)
    // and if this is not active, you will see policy payment methods returned
    // for farmers policies
    if (flags?.[FEATURE_FLAGS.PAYMENT_METHODS_API]) {
      const session = await getSession();
      const partyId = session?.user?.partyId || '';
      const partyRefData = await getPartyReferenceData(partyId, loggingContext);

      const policyPartyId = getPolicyPartyIdByPolicyNumber(
        partyRefData.data!,
        params.policyNumber
      );

      if (!policyPartyId) {
        throw new Error('Party id was not found on policy', {
          cause: {
            partyId,
            policyNumber: params.policyNumber,
            planCode: params.planCode,
            // TODO: need to parse out first/last name from this
            // partyRefDataAliases: partyRefData.data?.alias,
          },
        });
      }

      const { data: paymentMethods, error } = await getUserPaymentMethods(
        {
          policyNumber: params.policyNumber,
          planCode: params.planCode,
          policyPartyId,
        },
        loggingContext
      );

      // TODO: what additional info should we pass here?
      if (error) {
        throw error;
      }

      return transformPaymentMethods(paymentMethods);
    }

    const { data: bankDetails, error } = await getPaymentDetails(
      { policyNumber: params.policyNumber, planCode: params.planCode },
      loggingContext
    );

    if (error) {
      throw error;
    }

    return transformPaymentMethods(bankDetails);
  },
  { file: 'payment-methods', functionName: 'getPaymentMethods' }
);
