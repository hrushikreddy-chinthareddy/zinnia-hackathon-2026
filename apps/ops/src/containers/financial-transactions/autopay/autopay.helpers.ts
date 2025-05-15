import { AmountType } from '@zinnia/api-types/types/bpm';
import { SystematicProgram } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';
import { v4 as uuidV4 } from 'uuid';

import { ACH, Autopay } from '@deps/contexts/transactions/AutopayContext';
import { Reason, Status, SystematicProgram as SystematicPrograms, PaymentForm } from '@deps/models/policy/sor-policy';
import { SystematicProgramUpdateRequestQuery } from '@deps/queries/api/bpm';
import { NUMERIC_DATE_FORMAT, ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

export const buildSystematicProgramUpdateRequestBody = (
    autopay: Autopay,
    systematicProgram: SystematicProgram
): SystematicProgramUpdateRequestQuery => {
    const effectiveDateFormatted = dayjs(autopay.effectiveDate, NUMERIC_DATE_FORMAT).format(ZAHARA_API_DATE_FORMAT);

    return {
        caseId: autopay.caseId || '',
        correlationId: uuidV4(),
        effectiveDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
        reverseInitiator: autopay.reverseInitiator,
        systematicProgram: {
            amount: Number(autopay.paymentAmount),
            arrangementType: autopay.arrangementType,
            paymentForm: ACH,
            amountType: AmountType.AMOUNT,
            frequency: autopay.frequency,
            startDate: autopay.isSetUp ? effectiveDateFormatted : systematicProgram?.startDate,
            endDate: systematicProgram?.endDate,
            previousProgramDate: systematicProgram?.previousProgramDate,
            nextProgramDate: effectiveDateFormatted,
            party: {
                bankId: autopay.paymentBankId,
                partyId: autopay.payorPartyId,
            },
            parties: [
                {
                    allocationPercentage: 100,
                    bankId: autopay.paymentBankId,
                    partyId: autopay.payorPartyId,
                },
            ],
        },
    };
};

export const getSystematicInfo = (systematicPrograms?: SystematicPrograms[], systematicProgramReason?: Reason, isSetUp?: boolean) => {
    const systematicProgram = systematicPrograms?.find(sp => sp.reason === systematicProgramReason && sp.status === Status.ACTIVE);
    const arrangementId = isSetUp ? '' : systematicProgram?.arrangementId || '';

    return { systematicProgram, arrangementId };
};
export const buildSystematicWithdrawalProgramUpdateRequestBody = (
    autopay: Autopay,
    systematicProgram: SystematicProgram
): SystematicProgramUpdateRequestQuery => {
    const effectiveDateFormatted = dayjs(autopay.effectiveDate, NUMERIC_DATE_FORMAT).format(ZAHARA_API_DATE_FORMAT);

    return {
        caseId: autopay.caseId || '',
        correlationId: uuidV4(),
        effectiveDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
        reverseInitiator: autopay.reverseInitiator,
        systematicProgram: {
            amount: Number(autopay.paymentAmount),
            arrangementType: autopay.arrangementType,
            paymentForm: (autopay.paymentForm || ACH) as PaymentForm,
            amountType: AmountType.AMOUNT,
            frequency: autopay.frequency,
            startDate: autopay.isSetUp ? effectiveDateFormatted : systematicProgram?.startDate,
            endDate: systematicProgram?.endDate,
            previousProgramDate: systematicProgram?.previousProgramDate,
            nextProgramDate: effectiveDateFormatted,
            party: {
                bankId: autopay.paymentBankId,
                partyId: autopay.payeePartyId,
            },
            parties: [
                {
                    allocationPercentage: 100,
                    bankId: autopay.paymentBankId,
                    partyId: autopay.payeePartyId,
                    paymentForm: (autopay.paymentForm || ACH) as PaymentForm,
                    addressId: autopay.paymentAddressId,
                    forBenefitOfOrForFurtherCredit: autopay.fboFfc,
                },
            ],
        },
    };
};
