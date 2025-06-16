import { ApiResponse } from '@/services';
import { ClientApi } from '@/services/client-http';

export interface PaymentusPaymentMethodTokenParams {
  /**Tokenized profile value for a previously created payment method. When a token is present then the user will be editing an existing payment method instead of adding. */
  token?: string;
  /**
   * Unique identifier indicating to whom the payment method belongs (email address mapping to loginId used to retrieve profile). If not provided then the payment method is anonymous and will not be retrievable via our List Profiles API.
   */
  ownerId?: string;
  /**
   * Optional via configuration. This parameter adds a unique identifier to a newly created tokenized payment method. Future attempts to use the payment method will require the encrypted form of this value.
   */
  externalId?: string;
  /**
   * URL where the payment method token will be posted to. If a redirect is not provided, bypass can be used to present a page with a message to the user.
   */
  postMessagePmDetailsOrigin: string;
  /**
   * 2 to 5 letter language (e.g. en, fr, or es_us).
   */
  lang?: string;
  /**
   * Will be used to prepopulate card holder name field
   */
  firstName?: string;
  /**
   * Will be used to prepopulate card holder name field
   */
  lastName?: string;
  /**
   * User’s email address
   */
  email?: string;
  /**
   * milliseconds since January 1, 1970, 00:00:00 GMT
   */
  timestamp: number;
  /**
   * A custom reference number to be returned in the post-back
   */
  externalReference?: string;
  /**
   * Used to hide the optional nickname field. If false, then the nickname field will be hidden. Note field only applies if we enable client configuration to show the nickname by default.
   */
  nickname?: boolean;
  /**
   * Payment Type Configured by Paymentus. Passed when using PayPal with multiple MIDs and depends on the merchant ID configured for PayPal.
   */
  paymentTypeCode?: string;
  /**
   * See apps/consumer-experience/src/components/paymentus/paymentus.md
   */
  pmCategory: string;
}

export const getPaymentusToken = async (
  paymentusOptions: PaymentusPaymentMethodTokenParams
) => {
  const response: ApiResponse<any> = await (
    await ClientApi.post(
      `/api/paymentus/token`,
      JSON.stringify(paymentusOptions),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  ).json();

  if (response.error || !response) {
    throw response.error;
  }

  return response.data;
};
