import { BankDetail } from '@/components/person-data/types';
import { PaymentMethod } from '@/types/payment';
import {
  bankAccountNumberSanitizer,
  isEndDatedAndEndDateUpcoming,
} from '@/utils/data';

export const transformPaymentMethods = (
  bankDetails: BankDetail[] | null
): PaymentMethod[] => {
  if (!bankDetails) {
    return [];
  }

  const filteredDetails = bankDetails
    .map((b: BankDetail) => {
      return {
        ...b,
        accountNumber: bankAccountNumberSanitizer(b?.accountNumber),
        // TODO: add this back, which means we will have to make a policy call
        // to get this data or take it in as an arg saaaaad
        // autopayEnabled: b.bankId === autopayBankId(policy),
      };
    })
    .filter(bank => !isEndDatedAndEndDateUpcoming(bank.endDate));

  return filteredDetails.map(bankDetail => ({
    bankId: bankDetail.bankId,
    branchName: bankDetail.branchName,
    accountType: bankDetail.accountType,
    accountNumber: bankDetail.accountNumber,
    autopayEnabled: bankDetail.autopayEnabled || false,
    appliesToPartyId: bankDetail.appliesToPartyId,
    nameOnAccount: bankDetail.nameOnAccount,
    routingNumber: bankDetail.routingNumber,
  }));
};
