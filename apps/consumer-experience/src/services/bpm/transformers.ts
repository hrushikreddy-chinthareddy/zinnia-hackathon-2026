import {
  DisbursementPaymentForm,
  FilingStatus,
  PartialWithdrawalOneTimeRequest,
  PartyRole,
  PaymentForm,
  TaxWithholdingType,
  TransactionResponse,
} from '@zinnia/api-types/types/bpm';
import dayjs from 'dayjs';

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
  const effectiveDate = dayjs(state.withdrawalAmountStep.effectiveDate).format(
    'YYYY-MM-DD'
  );

  const disbursementToPartyPaymentFormMap: Partial<
    Record<DisbursementPaymentForm, PaymentForm>
  > = {
    [DisbursementPaymentForm.ACH]: PaymentForm.ACH,
    [DisbursementPaymentForm.CHECK]: PaymentForm.CHECK,
    [DisbursementPaymentForm.WIRE]: PaymentForm.WIRE,
    [DisbursementPaymentForm.DTCC]: PaymentForm.DTCC,
  };

  const partyPaymentForm =
    disbursementToPartyPaymentFormMap[
      state.distributionMethodStep.distributionType
    ];

  return {
    correlationId: correlationId,
    effectiveDate: effectiveDate,
    transactionAmounts: {
      requestedAmount: state.withdrawalAmountStep.paymentAmount,
      amountType: state.withdrawalAmountStep.amountType,
      disbursementType: state.withdrawalAmountStep.withdrawalType,
      disbursementPaymentForm: state.distributionMethodStep.distributionType,
    },
    fundAllocation: {
      allocationOption: state.withdrawalMethodStep.withdrawalMethod,
    },
    taxWithholdingInstructions: [
      {
        // owner party ID
        // unless the beneficiary outlives the owner
        partyId: state.payeeStep.payeePartyId,
        taxWithholdingType: TaxWithholdingType.FEDERAL,
        taxRateToUse: state.taxWithholdingsStep.federal.taxRateToUse,
        // need to find this
        filingStatus: FilingStatus.DEFAULT,
        dollar: Number(state.taxWithholdingsStep.federal.dollar),
        percentage: Number(state.taxWithholdingsStep.federal.percentage),
        // where do we get this?
        exemptions: Number(state.taxWithholdingsStep.federal.exemptions),
        // owner's tax jurisdiction
        taxJurisdiction: state.distributionMethodStep.address?.addrCountry,
      },
      {
        partyId: state.payeeStep.payeePartyId,
        taxWithholdingType: TaxWithholdingType.STATE,
        taxRateToUse: state.taxWithholdingsStep.state.taxRateToUse,
        filingStatus: FilingStatus.DEFAULT,
        dollar: Number(state.taxWithholdingsStep.state.dollar),
        percentage: Number(state.taxWithholdingsStep.state.percentage),
        // do we need this?
        exemptions: Number(state.taxWithholdingsStep.state.exemptions),
        // owner's tax jurisdiction
        taxJurisdiction: state.distributionMethodStep.address?.state,
      },
    ],
    parties: [
      {
        partyId: state.payeeStep.payeePartyId,
        paymentForm: partyPaymentForm,
        allocationPercentage: 100,
        bankId: state.distributionMethodStep.bank?.bankId,
        partyRole: PartyRole.PAYEE,
        addressId: state.distributionMethodStep.address?.addressId,
        forBenefitOfOrForFurtherCredit: 'TBD',
      },
    ],
    override: false,
  };
};

