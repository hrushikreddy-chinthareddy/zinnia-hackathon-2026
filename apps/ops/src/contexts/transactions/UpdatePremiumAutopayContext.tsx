import dayjs from 'dayjs';
import { Dispatch, PropsWithChildren, SetStateAction, createContext, useContext, useState } from 'react';

import { PaymentMethodType } from '@deps/components/workflows/payment-step/payment-step';
import { PayorType } from '@deps/components/workflows/payor-step/payor-step';
import { ReverseInitiatorType } from '@deps/containers/financial-transactions/premium/new-premium/amount/amount';
import { AmountType } from '@deps/containers/financial-transactions/premium/update-premium-autopay/amount/amount';
import { Frequency, PaymentForm } from '@deps/models/policy/sor-policy';
import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';

// ACH is the only supported payment type for MVP
export const ACH = PaymentForm.ACH;

interface Autopay extends AmountType, PayorType, PaymentMethodType, ReverseInitiatorType {
    caseId?: string;
}

type UpdatePremiumAutopayContextType = {
    autopay: Autopay;
    setAutopay: Dispatch<SetStateAction<Autopay>>;
};

const defaultValue = {
    autopay: {
        caseId: undefined,
        frequency: Frequency.MONTHLY,
        initValues: false,
        effectiveDate: dayjs().format(NUMERIC_DATE_FORMAT),
        paymentAccountNumber: '',
        paymentBankId: '',
        paymentBranchName: '',
        payorAddress: undefined,
        payorFullName: '',
        payorPartyId: '',
        paymentAmount: '',
        validationResponse: undefined,
        reverseInitiator: false,
    },
    setAutopay: () => {},
};

const UpdatePremiumAutopayContext = createContext<UpdatePremiumAutopayContextType>(defaultValue);

export const UpdatePremiumAutopayProvider = ({ children }: PropsWithChildren) => {
    const [autopay, setAutopay] = useState<Autopay>(defaultValue.autopay);

    return (
        <UpdatePremiumAutopayContext.Provider
            value={{
                autopay,
                setAutopay,
            }}
        >
            {children}
        </UpdatePremiumAutopayContext.Provider>
    );
};

export const useUpdatePremiumAutopay = () => {
    const context = useContext(UpdatePremiumAutopayContext);

    if (!context) {
        throw new Error('useUpdatePremiumAutopay must be used within a UpdatePremiumAutopayProvider');
    }
    return context;
};
