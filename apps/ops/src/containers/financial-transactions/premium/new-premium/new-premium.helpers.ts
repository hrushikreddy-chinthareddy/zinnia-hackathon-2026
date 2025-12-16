import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { v4 as uuidV4 } from 'uuid';

import { OneTimePremiumRequestQuery } from '@deps/queries/api/bpm';
import {
    NUMERIC_DATE_FORMAT,
    EDS_DATE_DISPLAY_FORMAT,
} from '@deps/types/constants';
import { PaymentForm } from '@zinnia/api-types/types/bpm';

import { Premium } from './amount/types';

dayjs.extend(utc);

export const buildNewPremiumRequestBody = (
    premium: Premium
): OneTimePremiumRequestQuery => {
    const now = dayjs();

    const effectiveDate = dayjs(premium.effectiveDate, NUMERIC_DATE_FORMAT)
        .set('hour', now.get('hour'))
        .set('minute', now.get('minute'))
        .set('second', now.get('second'));

    return {
        caseId: premium.caseId || '',
        correlationId: uuidV4(),
        effectiveDate: dayjs(effectiveDate)
            .utc()
            .format(EDS_DATE_DISPLAY_FORMAT),
        reverseInitiator: premium.reverseInitiator,
        transactionAmounts: {
            requestedAmount: Number(premium.paymentAmount),
        },
        payor: {
            bankId: premium.paymentBankId,
            partyId: premium.payorPartyId,
            paymentForm: PaymentForm.ACH,
        },
    };
};
