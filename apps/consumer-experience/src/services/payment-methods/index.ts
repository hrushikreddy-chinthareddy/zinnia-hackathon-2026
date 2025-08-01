import { PaymentProvider } from '@/types/carrier-config';
import { PaymentMethod } from '@/types/payment';
import { PolicyRequestInputs } from '@/types/policy';
import { isProd } from '@/utils';
import { logApiNotOkDetails, parseAPIResponse } from '@/utils/api';
import { logInfo, logWarn } from '@/utils/logging/log-fns';
import { CommonLogContext } from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';

import { transformPaymentMethods } from './transformers';
import { aggregationBaseUrl } from '../api-config';
import { getPaymentDetails } from '../policy';
import { ServerApi } from '../server-http';

export interface ZinniaPaymentMethodParams {
  policyNumber: string;
  planCode: string;
}

export interface PaymentusPaymentMethodParams {
  paymentProvider: PaymentProvider.PAYMENTUS;
}

export type PaymentMethodParams = ZinniaPaymentMethodParams;

const FILE_NAME =
  'apps/consumer-experience/src/services/payment-methods/index.ts';

export const getUserPaymentMethods = withLogging(
  async (options: PolicyRequestInputs, loggingCtx: CommonLogContext) => {
    const { planCode, policyNumber } = options;
    const url = `${aggregationBaseUrl}/policies/${planCode}/${policyNumber}/paymentmethods`;
    const rawResponse = await ServerApi.get(url, undefined, loggingCtx);
    const response = await parseAPIResponse(rawResponse);
    if (rawResponse.status === 404) {
      logWarn('No payment details found for user', {
        ...logApiNotOkDetails({ rawResponse, parsedResponse: response }),
      });

      return response;
    }

    if (!rawResponse?.ok) {
      throw new Error('Error fetching policy.', {
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
    // TODO: THIS SHOULD BE A FEATURE FLAG BUT NONE OF US HAVE ACCESS
    // TO CONSUMER FEATURE FLAGS RIGHT NOW
    // What this means is that we will be using the getPaymentDetails
    // call for all carriers (so paymentus will not longer be called on farmers policies)
    // and if this is not active, you will see policy payment methods returned
    // for farmers policies
    if (!isProd()) {
      const { data: paymentMethods, error } = await getUserPaymentMethods(
        { policyNumber: params.policyNumber, planCode: params.planCode },
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
