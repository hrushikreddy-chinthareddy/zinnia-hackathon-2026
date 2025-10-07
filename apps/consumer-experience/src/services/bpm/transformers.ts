import {
  AmountType,
  ArrangementType,
  DisbursementPaymentForm,
  FilingStatus,
  PartialWithdrawalOneTimeRequest,
  PartyRole,
  PaymentForm,
  SystematicProgramUpdateRequest,
  TaxWithholdingType,
  TransactionResponse,
} from '@zinnia/api-types/types/bpm';
import dayjs from 'dayjs';

import { convertAggregationAccountTypeToPaymentForm } from '@/app/api/bpm/[planCode]/[policyNumber]/onetimepremium/utils';
import { SystematicPremiumsState } from '@/components/stepped-workflow/workflows/systematic-premiums/provider/types';
import { WithdrawalsState } from '@/components/stepped-workflow/workflows/withdrawals/provider/types';
import { TransactionEligbility } from '@/types/transactions';
import { eligibilityStatus } from '@/utils/data';
import { ZAHARA_DATE_FORMAT } from '@/utils/dates';

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

export const systematicPremiumsStateToPolicyRequestInput = (
  state: SystematicPremiumsState,
  correlationId: string
): SystematicProgramUpdateRequest => {
  const nextProgramDateFormatted = dayjs(
    state.systematicPremiumAmountStep?.nextPaymentDate
  ).format(ZAHARA_DATE_FORMAT);
  const result: SystematicProgramUpdateRequest = {
    correlationId: correlationId,
    effectiveDate: dayjs().format(ZAHARA_DATE_FORMAT),
    reverseInitiator: false,
    systematicProgram: {
      amount: state?.systematicPremiumAmountStep?.paymentAmount || undefined,
      amountType: AmountType.AMOUNT,
      arrangementType: ArrangementType.PAYMENT,
      frequency: state?.systematicPremiumAmountStep?.paymentFrequency,
      paymentForm: convertAggregationAccountTypeToPaymentForm(
        state.selectBankStep.accountType
      ),
      startDate:
        state?.currentSystematicPremium?.startDate || nextProgramDateFormatted,
      endDate: state?.currentSystematicPremium?.endDate,
      previousProgramDate: state?.currentSystematicPremium?.previousProgramDate,
      nextProgramDate: nextProgramDateFormatted,
      // party: {
      //   bankId: state.selectBankStep.bankId,
      //   partyId: state.selectBankStep.appliesToPartyId,
      // },
      // TODO: is this something we should be editing what is the difference between this and
      // party above?
      parties: [
        {
          allocationPercentage: 100,
          bankId: state.selectBankStep.bankId,
          partyId: state.selectBankStep.appliesToPartyId,
          //TODO: this will not work for everly until the paymentMethods
          // API is updated to return the correct paymentForm
          paymentForm: convertAggregationAccountTypeToPaymentForm(
            state.selectBankStep.accountType
          ),
        },
      ],
    },
  };

  return result;
};
