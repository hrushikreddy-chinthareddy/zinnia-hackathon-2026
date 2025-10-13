import {
  DisbursementPaymentForm,
  PaymentForm,
  AmountType,
  DisbursementType,
  TaxWithholdingType,
  FilingStatus,
} from '@xd/api-types/dist/generated-types/bpm';
import dayjs from 'dayjs';

import { SurrenderState } from '@/components/stepped-workflow/workflows/surrender/provider/types';
import { FullSurrenderBPMRequest } from '@/services/bpm/fullsurrender';

export const buildFullSurrenderRequestBody = (
  state: SurrenderState,
  correlationId: string
): FullSurrenderBPMRequest => {
  const effectiveDate = dayjs(state.dateStep.surrenderDate).format(
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
      // This field is not present in the documentation and api spec
      // However, according to the working payload provided by the backend team, it is required
      // Working payload can be found linked here: https://zinnia.atlassian.net/browse/CUI-918?focusedCommentId=2378401
      requestedAmount: state.dateStep.netSurrenderValue,
      // According to the backend team this is always a gross amount
      amountType: AmountType.AMOUNT,
      disbursementType: DisbursementType.GROSS,
      disbursementPaymentForm: state.distributionMethodStep.distributionType,
    },

    taxWithholdingInstructions: [
      {
        partyId: state.payeeStep.payeePartyId,
        taxWithholdingType: TaxWithholdingType.FEDERAL,
        taxRateToUse: state.taxWithholdingsStep.federal.taxRateToUse,
        filingStatus: FilingStatus.DEFAULT,
        dollar: Number(state.taxWithholdingsStep.federal.dollar),
        percentage: Number(state.taxWithholdingsStep.federal.percentage),
        // This is not captured in the UI, but is required by the API
        // In zinnia live, this is set to 0, as that was what was instructed by the backend team
        // While testing this, the api also returns 200 if this is set to null/undefined
        // So we can set this to null/undefined if we want
        exemptions: 0,
        // @TODO: in the working payload provided by the backend team, this was set to USA_WI
        // should the jurisdiction be formatted to be USA_[state] ?
        taxJurisdiction: state.distributionMethodStep.address?.addrCountry,
      },
      {
        partyId: state.payeeStep.payeePartyId,
        taxWithholdingType: TaxWithholdingType.STATE,
        taxRateToUse: state.taxWithholdingsStep.state.taxRateToUse,
        filingStatus: FilingStatus.DEFAULT,
        dollar: Number(state.taxWithholdingsStep.state.dollar),
        percentage: Number(state.taxWithholdingsStep.state.percentage),
        exemptions: 0,
        taxJurisdiction: state.distributionMethodStep.address?.state,
      },
    ],
    parties: [
      {
        // According to the backend team these are the only fields that are required for the parties
        partyId: state.payeeStep.payeePartyId,
        paymentForm: partyPaymentForm,
        bankId: state.distributionMethodStep.bank?.bankId,
        allocationPercentage: 100,
        addressId: state.distributionMethodStep.address?.addressId,
      },
    ],
  };
};
