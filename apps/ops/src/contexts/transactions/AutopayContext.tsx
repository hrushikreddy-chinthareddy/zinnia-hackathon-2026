import dayjs from 'dayjs';
import { Dispatch, PropsWithChildren, SetStateAction, createContext, useContext, useState } from 'react';

import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import { PayeesType } from '@deps/components/workflows/payees-step/payees-step';
import { PaymentMethodType } from '@deps/components/workflows/payment-step/types';
import { PayorType } from '@deps/components/workflows/payor-step/payor-step';
import { AmountType, ReverseInitiatorType } from '@deps/containers/financial-transactions/autopay/amount/amount';
import { ArrangementType, FilingStatus, Frequency, PaymentForm, Reason } from '@deps/models/policy/sor-policy';
import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';

// ACH is the only supported payment type for MVP
export const ACH = PaymentForm.ACH;

type AutopayDynamicProps = {
    arrangementType?: ArrangementType;
    isSetUp?: boolean;
    parentPage?: ParentPage;
    systematicProgramReason?: Reason;
    translationKeyPrefix: string;
};

export interface Autopay extends AmountType, PayorType, PayeesType, PaymentMethodType, ReverseInitiatorType, AutopayDynamicProps {
    caseId?: string;
}

type AutopayContextType = {
    autopay: Autopay;
    setAutopay: Dispatch<SetStateAction<Autopay>>;
};

const defaultValue = {
    autopay: {
        arrangementType: undefined,
        parentPage: undefined,
        systematicProgramReason: undefined,
        translationKeyPrefix: '',
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
        isSetUp: false,
        payeeFullName: '',
        payeePartyId: '',
        payeeFilingStatus: FilingStatus.DEFAULT as any,
        payeeTaxJurisdiction: '',
        fboFfc: undefined,
        paymentForm: undefined,
        amountType: undefined,
    },
    setAutopay: () => {},
};

const AutopayContext = createContext<AutopayContextType>(defaultValue);

export const AutopayProvider = ({ children }: PropsWithChildren) => {
    const [autopay, setAutopay] = useState<Autopay>(defaultValue.autopay);

    return (
        <AutopayContext.Provider
            value={{
                autopay,
                setAutopay,
            }}
        >
            {children}
        </AutopayContext.Provider>
    );
};

export const useAutopay = () => {
    const context = useContext(AutopayContext);

    if (!context) {
        throw new Error('useAutopay must be used within a AutopayProvider');
    }
    return context;
};
