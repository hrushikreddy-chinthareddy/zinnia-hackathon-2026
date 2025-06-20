import { PaymentProvider } from '@/types/carrier-config';
import { PaymentMethod } from '@/types/payment';
import { CommonLogContext } from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';

import { getPaymentusUserPaymentsList } from './paymentus';
import { getPaymentDetails } from '../policy';
import {
  transformPaymentusProfiles,
  transformBankDetails,
} from './transformers';

export interface ZinniaPaymentMethodParams {
  policyNumber: string;
  planCode: string;
  paymentProvider: PaymentProvider.ZINNIA;
}

export interface PaymentusPaymentMethodParams {
  paymentProvider: PaymentProvider.PAYMENTUS;
}

export type PaymentMethodParams =
  | ZinniaPaymentMethodParams
  | PaymentusPaymentMethodParams;

export const getPaymentMethods = withLogging(
  async (
    params: PaymentMethodParams,
    loggingContext: CommonLogContext
  ): Promise<PaymentMethod[]> => {
    if (params.paymentProvider == PaymentProvider.PAYMENTUS) {
      const { data: paymentusPaymentMethods, error } =
        await getPaymentusUserPaymentsList(
          {
            isMock: false,
          },
          loggingContext
        );

      if (error) {
        throw error;
      }
      return transformPaymentusProfiles(paymentusPaymentMethods);
    }

    const { data: bankDetails, error } = await getPaymentDetails(
      { policyNumber: params.policyNumber, planCode: params.planCode },
      loggingContext
    );

    if (error) {
      throw error;
    }

    return transformBankDetails(bankDetails);
  },
  { file: 'payment-methods', functionName: 'getPaymentMethods' }
);
