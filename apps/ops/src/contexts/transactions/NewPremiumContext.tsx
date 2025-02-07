import dayjs from 'dayjs';
import { Dispatch, PropsWithChildren, SetStateAction, createContext, useContext, useState } from 'react';

import { PaymentMethodType } from '@deps/components/workflows/payment-step/payment-step';
import { PayorType } from '@deps/components/workflows/payor-step/payor-step';
import { AmountType, ReverseInitiatorType } from '@deps/containers/financial-transactions/premium/new-premium/amount/amount';
import { PaymentForm } from '@deps/models/policy/sor-policy';
import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';

// ACH is the only supported payment type for MVP
export const ACH = PaymentForm.ACH;

interface Premium extends AmountType, PaymentMethodType, PayorType, ReverseInitiatorType {
    caseId?: string;
}

type NewPremiumContextType = {
    premium: Premium;
    setPremium: Dispatch<SetStateAction<Premium>>;
};

const defaultValue = {
    premium: {
        caseId: undefined,
        effectiveDate: dayjs().format(NUMERIC_DATE_FORMAT),
        nextPaymentDate: dayjs().format(NUMERIC_DATE_FORMAT),
        paymentAccountNumber: '',
        paymentBankId: '',
        paymentBranchName: '',
        paymentAmount: '',
        payorAddress: undefined,
        payorFullName: '',
        payorPartyId: '',
        validationResponse: undefined,
        reverseInitiator: false,
    },
    setPremium: () => {},
};

const NewPremiumContext = createContext<NewPremiumContextType>(defaultValue);

export const NewPremiumProvider = ({ children }: PropsWithChildren) => {
    const [premium, setPremium] = useState<Premium>(defaultValue.premium);

    return (
        <NewPremiumContext.Provider
            value={{
                premium,
                setPremium,
            }}
        >
            {children}
        </NewPremiumContext.Provider>
    );
};

export const usePremium = () => {
    const context = useContext(NewPremiumContext);

    if (!context) {
        throw new Error('usePremium must be used within a NewPremiumProvider');
    }
    return context;
};
