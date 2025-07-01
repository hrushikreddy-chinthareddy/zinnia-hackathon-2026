import { Dispatch, SetStateAction } from 'react';

import { PaymentMethodType } from '@deps/components/workflows/payment-step/types';
import { PayorType } from '@deps/components/workflows/payor-step/payor-step';

export type AmountType = {
    effectiveDate: string;
    paymentAmount: string;
};

export type ReverseInitiatorType = {
    reverseInitiator: boolean;
};

export interface Premium
    extends AmountType,
        PaymentMethodType,
        PayorType,
        ReverseInitiatorType {
    caseId?: string;
}

export type NewPremiumContextType = {
    premium: Premium;
    setPremium: Dispatch<SetStateAction<Premium>>;
};
