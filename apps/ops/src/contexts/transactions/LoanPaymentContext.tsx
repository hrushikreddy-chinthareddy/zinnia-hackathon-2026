import { PaymentForm } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';
import {
    Dispatch,
    PropsWithChildren,
    SetStateAction,
    createContext,
    useContext,
    useState,
} from 'react';

import { PaymentMethodType } from '@deps/components/workflows/payment-step/types';
import { PayorType } from '@deps/components/workflows/payor-step/payor-step';
import {
    AmountType,
    ReverseInitiatorType,
} from '@deps/containers/financial-transactions/loan/loan-payment/amount/types';
import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';

// ACH is the only supported payment type for MVP
export const ACH = PaymentForm.ACH;

export interface LoanPayment
    extends AmountType,
        PaymentMethodType,
        PayorType,
        ReverseInitiatorType {
    caseId?: string;
}

type LoanPaymentContextType = {
    loanPayment: LoanPayment;
    setLoanPayment: Dispatch<SetStateAction<LoanPayment>>;
};

const defaultValue = {
    loanPayment: {
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
    setLoanPayment: () => {},
};

const LoanPaymentContext = createContext<LoanPaymentContextType>(defaultValue);

export const LoanPaymentProvider = ({ children }: PropsWithChildren) => {
    const [loanPayment, setLoanPayment] = useState<LoanPayment>(
        defaultValue.loanPayment
    );

    return (
        <LoanPaymentContext.Provider
            value={{
                loanPayment,
                setLoanPayment,
            }}
        >
            {children}
        </LoanPaymentContext.Provider>
    );
};

export const useLoanPayment = () => {
    const context = useContext(LoanPaymentContext);

    if (!context) {
        throw new Error(
            'useLoanPayment must be used within a LoanPaymentContext'
        );
    }
    return context;
};
