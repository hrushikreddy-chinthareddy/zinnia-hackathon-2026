import {
    AllocationOption,
    AmountType,
    FullSurrenderRequest,
    PartialWithdrawalOneTimeRequest,
    PaymentForm,
} from '@zinnia/api-types/types/bpm';
import dayjs from 'dayjs';
import { v4 as uuidV4 } from 'uuid';

import { Withdrawal } from '@deps/contexts/transactions/WithdrawalContext.types';
import { getDisbursementPaymentForm } from '@deps/helpers/transactions/payment.helpers';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

export const buildWithdrawalsRequestBody = (
    withdrawal: Withdrawal,
    wireCheckPaymentsEnabled: boolean
): FullSurrenderRequest | PartialWithdrawalOneTimeRequest => {
    if (wireCheckPaymentsEnabled) {
        return {
            caseId: withdrawal.caseId || '',
            correlationId: uuidV4(),
            effectiveDate: dayjs(withdrawal.effectiveDate, 'MMDDYYYY').format(
                ZAHARA_API_DATE_FORMAT
            ),
            parties: [
                {
                    allocationPercentage: 100,
                    bankId: withdrawal.paymentBankId,
                    partyId: withdrawal.payeePartyId,
                    paymentForm: withdrawal.paymentForm || PaymentForm.ACH,
                    addressId: withdrawal.paymentAddressId,
                    forBenefitOfOrForFurtherCredit: withdrawal.fboFfc,
                },
            ],
            fundAllocation: {
                allocationOption: AllocationOption.DEFAULT,
            },
            reverseInitiator: false,
            taxWithholdingInstructions: [
                {
                    ...withdrawal.taxWithholdingInstructions[0],
                    partyId: withdrawal.payeePartyId,
                    filingStatus: withdrawal.payeeFilingStatus,
                    taxJurisdiction: withdrawal.payeeTaxJurisdiction,
                },
                {
                    ...withdrawal.taxWithholdingInstructions[1],
                    partyId: withdrawal.payeePartyId,
                    filingStatus: withdrawal.payeeFilingStatus,
                    taxJurisdiction: withdrawal.payeeTaxJurisdiction,
                },
            ],
            transactionAmounts: {
                amountType: AmountType.AMOUNT,
                disbursementType: withdrawal.disbursementType,
                disbursementPaymentForm: getDisbursementPaymentForm(
                    withdrawal.paymentForm
                ),
                requestedAmount: Number(withdrawal.amount),
            },
        };
    }

    return {
        caseId: withdrawal.caseId || '',
        correlationId: uuidV4(),
        effectiveDate: dayjs(withdrawal.effectiveDate, 'MMDDYYYY').format(
            ZAHARA_API_DATE_FORMAT
        ),
        payeeOrBeneficiary: [
            {
                allocationPercentage: 100,
                bankId: withdrawal.paymentBankId,
                partyId: withdrawal.payeePartyId,
                paymentForm: PaymentForm.ACH,
            },
        ],
        fundAllocation: {
            allocationOption: AllocationOption.DEFAULT,
        },
        reverseInitiator: false,
        taxWithholdingInstructions: [
            {
                ...withdrawal.taxWithholdingInstructions[0],
                partyId: withdrawal.payeePartyId,
                filingStatus: withdrawal.payeeFilingStatus,
                taxJurisdiction: withdrawal.payeeTaxJurisdiction,
            },
            {
                ...withdrawal.taxWithholdingInstructions[1],
                partyId: withdrawal.payeePartyId,
                filingStatus: withdrawal.payeeFilingStatus,
                taxJurisdiction: withdrawal.payeeTaxJurisdiction,
            },
        ],
        transactionAmounts: {
            amountType: AmountType.AMOUNT,
            disbursementType: withdrawal.disbursementType,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            disbursementPaymentForm: PaymentForm.ACH,
            requestedAmount: Number(withdrawal.amount),
        },
    };
};
