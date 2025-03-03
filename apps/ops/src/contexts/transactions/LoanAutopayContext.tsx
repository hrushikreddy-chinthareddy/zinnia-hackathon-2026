import dayjs from 'dayjs';
import { Dispatch, PropsWithChildren, SetStateAction, createContext, useContext, useState } from 'react';

import { PaymentMethodType } from '@deps/components/workflows/payment-step/payment-step';
import { PayorType } from '@deps/components/workflows/payor-step/payor-step';
import { AmountType } from '@deps/containers/financial-transactions/loan/loan-autopay/amount/amount';
import { ReverseInitiatorType } from '@deps/containers/financial-transactions/loan/loan-payment/amount/amount';
import { Frequency, PaymentForm } from '@deps/models/policy/sor-policy';
import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';

// ACH is the only supported payment type for MVP
export const ACH = PaymentForm.ACH;

interface Autopay extends AmountType, PayorType, PaymentMethodType, ReverseInitiatorType {
    caseId?: string;
}

type LoanAutopayContextType = {
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

const LoanAutopayContext = createContext<LoanAutopayContextType>(defaultValue);

export const LoanAutopayProvider = ({ children }: PropsWithChildren) => {
    const [autopay, setAutopay] = useState<Autopay>(defaultValue.autopay);

    return (
        <LoanAutopayContext.Provider
            value={{
                autopay,
                setAutopay,
            }}
        >
            {children}
        </LoanAutopayContext.Provider>
    );
};

export const useLoanAutopay = () => {
    const context = useContext(LoanAutopayContext);

    if (!context) {
        throw new Error('useLoanAutopay must be used within a LoanAutopayProvider');
    }
    return context;
};
