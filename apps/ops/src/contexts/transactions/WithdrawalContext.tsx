import {
    DisbursementType,
    FilingStatus,
    TaxWithholdingType,
} from '@zinnia/api-types/types/bpm';
import dayjs from 'dayjs';
import {
    Dispatch,
    PropsWithChildren,
    SetStateAction,
    createContext,
    useContext,
    useState,
} from 'react';

import { WithdrawalType } from '@deps/containers/financial-transactions/withdrawal/amount/types';
import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';

import { Withdrawal } from './WithdrawalContext.types';

type WithdrawalContextType = {
    withdrawal: Withdrawal;
    setWithdrawal: Dispatch<SetStateAction<Withdrawal>>;
};

const defaultValue = {
    withdrawal: {
        amount: 0,
        caseId: undefined,
        disbursementType: DisbursementType.GROSS,
        effectiveDate: dayjs().format(NUMERIC_DATE_FORMAT),
        fboFcc: undefined,
        nextPaymentDate: dayjs().format(NUMERIC_DATE_FORMAT),
        paymentAccountNumber: '',
        paymentAddressId: '',
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
        type: WithdrawalType.Default,
        validationResponse: undefined,
        withdrawalAmount: '$0.00',
        withdrawalCustomAmount: '',
    },
    setWithdrawal: () => {},
};

const WithdrawalContext = createContext<WithdrawalContextType>(defaultValue);

export const WithdrawalProvider = ({ children }: PropsWithChildren) => {
    const [withdrawal, setWithdrawal] = useState<Withdrawal>(
        defaultValue.withdrawal
    );

    return (
        <WithdrawalContext.Provider
            value={{
                withdrawal,
                setWithdrawal,
            }}
        >
            {children}
        </WithdrawalContext.Provider>
    );
};

export const useWithdrawal = () => {
    const context = useContext(WithdrawalContext);

    if (!context) {
        throw new Error(
            'useWithdrawal must be used within a WithdrawalContext'
        );
    }
    return context;
};
