import {
  DisbursementPaymentForm,
  PaymentForm,
  DisbursementType,
} from '@zinnia/api-types/types/bpm';
import { BankAccount, Address } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';

import { FreeLookCancelState } from '@/components/stepped-workflow/workflows/free-look-cancel/provider/types';
import { FreeLookCancellationBPMRequest } from '@/services/bpm/free-look-cancel';

export const buildFreeLookCancellationRequestBody = (
  state: FreeLookCancelState,
  correlationId: string
): FreeLookCancellationBPMRequest => {
  const effectiveDate = dayjs(state.dateStep.cancellationDate).format(
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
    disbursementToPartyPaymentFormMap[state.distributionMethodStep.type];

  const bankAccount = state.distributionMethodStep.method as BankAccount;
  const address = state.distributionMethodStep.method as Address;

  return {
    correlationId: correlationId,
    effectiveDate: effectiveDate,
    transactionAmounts: {
      disbursementType: DisbursementType.GROSS,
      disbursementPaymentForm: state.distributionMethodStep.type,
    },
    payeeOrBeneficiary: {
      partyId: state.payeeStep?.partyId || undefined,
    },
    parties: [
      {
        partyId: state.payeeStep?.partyId || undefined,
        paymentForm: partyPaymentForm,
        bankId:
          state.distributionMethodStep.type === DisbursementPaymentForm.ACH
            ? bankAccount?.bankId
            : undefined,
        allocationPercentage: 100,
        addressId:
          state.distributionMethodStep.type === DisbursementPaymentForm.CHECK
            ? address?.addressId
            : undefined,
      },
    ],
    reverseInitiator: false,
  };
};
