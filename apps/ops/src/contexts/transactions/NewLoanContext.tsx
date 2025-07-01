import {
    DisbursementType,
    FilingStatus,
    TaxWithholdingInstructions,
    TaxWithholdingType,
} from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';
import {
    Dispatch,
    PropsWithChildren,
    SetStateAction,
    createContext,
    useContext,
    useState,
} from 'react';

import { PayeesType } from '@deps/components/workflows/payees-step/payees-step';
import { PaymentMethodType } from '@deps/components/workflows/payment-step/types';
import { AmountType } from '@deps/containers/financial-transactions/loan/new-loan/amount/types';
import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';

export interface NewLoan extends AmountType, PayeesType, PaymentMethodType {
    caseId?: string;
    taxWithholdingInstructions: TaxWithholdingInstructions[];
}

type NewLoanContextType = {
    newLoan: NewLoan;
    setNewLoan: Dispatch<SetStateAction<NewLoan>>;
};

const defaultValue = {
    newLoan: {
        amount: 0,
        caseId: undefined,
        disbursementType: DisbursementType.GROSS,
        effectiveDate: dayjs().format(NUMERIC_DATE_FORMAT),
        nextPaymentDate: dayjs().format(NUMERIC_DATE_FORMAT),
        paymentAccountNumber: '',
        paymentBankId: '',
        paymentBranchName: '',
        paymentAmount: '',
        payeeFullName: '',
        payeePartyId: '',
        payeeFilingStatus: FilingStatus.DEFAULT,
        payeeTaxJurisdiction: '',
        taxWithholdingInstructions: [
            {
                taxWithholdingType: TaxWithholdingType.FEDERAL,
            },
            {
                taxWithholdingType: TaxWithholdingType.STATE,
            },
        ],
        validationResponse: undefined,
        newLoanAmount: '$0.00',
        newLoanCustomAmount: '',
    },
    setNewLoan: () => {},
};

const NewLoanContext = createContext<NewLoanContextType>(defaultValue);

export const NewLoanProvider = ({ children }: PropsWithChildren) => {
    const [newLoan, setNewLoan] = useState<NewLoan>(defaultValue.newLoan);

    return (
        <NewLoanContext.Provider
            value={{
                newLoan,
                setNewLoan,
            }}
        >
            {children}
        </NewLoanContext.Provider>
    );
};

export const useNewLoan = () => {
    const context = useContext(NewLoanContext);

    if (!context) {
        throw new Error('useNewLoan must be used within a NewLoanContext');
    }
    return context;
};
