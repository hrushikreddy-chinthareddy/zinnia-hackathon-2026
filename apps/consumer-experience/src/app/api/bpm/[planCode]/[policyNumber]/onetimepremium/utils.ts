import { PaymentForm } from '@zinnia/api-types/types/bpm';
import { AccountType } from '@zinnia/api-types/types/sor';

// We get the payment methods from this endpoint
// https://cloud.konghq.com/us/service-catalog/7ae9ae96-2f8c-4f72-bfab-0343e4e486e5/api-specs/ccb2b51a-7da8-46bd-9abe-102262c221a4#/operations/getPaymentMethods
// which only returns accountType and is what we've been told
// we should use for the paymentForm for submission however for some carriers
// this is returning "CHECKING" and "SAVINGS" instead of "ACH"
// https://zinnia.atlassian.net/browse/ZLCM-4438
// THIS NEEDS TO BE TEMPORARY, the API should return the expected payment forms for all carriers
// I copied this function from the inimitable Brian from ops payment.helpers.ts
export const convertAggregationAccountTypeToPaymentForm = (
  accountType: string | AccountType | undefined
): PaymentForm | undefined => {
  if (!accountType) {
    return undefined;
  }

  // First check if the account type matches a payment form 1:1
  const matchesPaymentForm = Object.values(PaymentForm).find(
    form => accountType.toLowerCase() === form.toLowerCase()
  );

  if (matchesPaymentForm) {
    return matchesPaymentForm;
  }

  // If not, use the below mapping
  switch (accountType?.toLowerCase()) {
    case AccountType.CHECKING.toLowerCase():
    case AccountType.SAVINGS.toLowerCase():
      return PaymentForm.ACH;
    case AccountType.CREDITCARD.toLowerCase():
    case AccountType.DEBITCARD.toLowerCase():
      return PaymentForm.CREDITCARD;
    case AccountType.BROKERAGEACCOUNT.toLowerCase():
    case AccountType.CERTIFICATEOFDEPOSIT.toLowerCase():
      return PaymentForm.CHECK;
    default:
      return undefined;
  }
};
