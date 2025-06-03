import {
  AllocationOption,
  AmountType,
  DisbursementPaymentForm,
  DisbursementType,
  PartialWithdrawalOneTimeRequest,
  TaxRateToUse,
  TaxWithholdingType,
  TransactionResponse,
} from '@zinnia/api-types/types/bpm';

import { WithdrawalsState } from '@/components/providers/withdrawals/types';
import { TransactionEligbility } from '@/types/transactions';
import { eligibilityStatus } from '@/utils/data';

export const transformEligibility = (
  eligibility: TransactionResponse
): TransactionEligbility => {
  return {
    isEligible: eligibilityStatus(eligibility),
    reason: eligibility.error,
  };
};

export const withdrawalStateToPolicyRequestInput = (
  state: WithdrawalsState,
  correlationId: string
): PartialWithdrawalOneTimeRequest => {
  return {
    correlationId: correlationId,
    effectiveDate: state.withdrawalAmountStep.effectiveDate,
    transactionAmounts: {
      requestedAmount: state.withdrawalAmountStep.paymentAmount,
      amountType: AmountType.AMOUNT,
      disbursementType: DisbursementType.GROSS,
      disbursementPaymentForm: DisbursementPaymentForm.ACH,
    },
    fundAllocation: {
      allocationOption: AllocationOption.PRORATA,
    },
    taxWithholdingInstructions: [
      {
        partyId: state.payeeStep.payeePartyId,
        taxRateToUse: TaxRateToUse.USEVALUESENTERED,
        taxWithholdingType: TaxWithholdingType.FEDERAL,
        taxJurisdiction: state.distributionMethodStep.address?.addrCountry,
        dollar:
          state.taxWithholdingsStep.federal.type === 'dollar'
            ? Number(state.taxWithholdingsStep.federal.amount)
            : undefined,
        percentage:
          state.taxWithholdingsStep.federal.type === 'percentage'
            ? Number(state.taxWithholdingsStep.federal.amount)
            : undefined,
      },
      {
        taxWithholdingType: TaxWithholdingType.STATE,
        taxJurisdiction: state.distributionMethodStep.address?.state,
        dollar:
          state.taxWithholdingsStep.state.type === 'dollar'
            ? Number(state.taxWithholdingsStep.state.amount)
            : undefined,
        partyId: state.payeeStep.payeePartyId,
        taxRateToUse: TaxRateToUse.USEVALUESENTERED,
        percentage:
          state.taxWithholdingsStep.state.type === 'percentage'
            ? Number(state.taxWithholdingsStep.state.amount)
            : undefined,
      },
    ],
    fundDistributions: [
      {
        fundId: state.distributionMethodStep.bank?.bankId,
        fundName: state.distributionMethodStep.bank?.branchName,
        totalFundValue: 0,
        fundDistributionSegments: [
          {
            segmentId: 'iejfijf',
            currentAmount: 0,
            requestedAmount: 0,
          },
        ],
      },
    ],
    payeeOrBeneficiary: [
      {
        partyId: state.payeeStep.payeePartyId,
      },
    ],
  };
};
