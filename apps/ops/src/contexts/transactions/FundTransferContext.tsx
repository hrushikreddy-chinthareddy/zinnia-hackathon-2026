import dayjs from 'dayjs';
import {
    Dispatch,
    PropsWithChildren,
    SetStateAction,
    createContext,
    useContext,
    useState,
} from 'react';

import { AmountType } from '@deps/models/funds/enums';
import { TransactionResponse } from '@deps/queries/api/bpm';
import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';
import { AllocationOption } from '@zinnia/api-types/types/sor';

export type FundTransfer = {
    caseId?: string;
    correlationId?: string;
    effectiveDate?: string;
    reverseInitiator?: boolean;

    fundAllocation: {
        allocationOption: AllocationOption;
    };
    transactionAmounts: {
        amountType: AmountType;
    };
    funds: {
        transferFrom: {
            fundId: string;
            fundName: string;
            requestedAmount: string | number;
        }[];
        transferTo: {
            fundId: string;
            fundName: string;
            requestedAmount: string | number;
        }[];
    };
    validationResponse?: TransactionResponse;
};

type FundTransferContextType = {
    fundTransfer: FundTransfer;
    setFundTransfer: Dispatch<SetStateAction<FundTransfer>>;
};

const defaultValue: FundTransferContextType = {
    fundTransfer: {
        caseId: undefined,
        correlationId: '',
        effectiveDate: dayjs().format(NUMERIC_DATE_FORMAT),
        fundAllocation: {
            allocationOption: AllocationOption.SPECIFIEDFUNDS,
        },
        transactionAmounts: {
            amountType: AmountType.Amount,
        },
        reverseInitiator: false,
        funds: {
            transferFrom: [
                {
                    fundId: '',
                    fundName: '',
                    requestedAmount: '',
                },
            ],
            transferTo: [
                {
                    fundId: '',
                    fundName: '',
                    requestedAmount: '',
                },
            ],
        },
        validationResponse: undefined,
    },
    setFundTransfer: () => {},
};

const FundTransferContext =
    createContext<FundTransferContextType>(defaultValue);

export const FundTransferProvider = ({ children }: PropsWithChildren) => {
    const [fundTransfer, setFundTransfer] = useState<FundTransfer>(
        defaultValue.fundTransfer
    );

    return (
        <FundTransferContext.Provider
            value={{
                fundTransfer,
                setFundTransfer,
            }}
        >
            {children}
        </FundTransferContext.Provider>
    );
};

export const useFundTransfer = () => {
    const context = useContext(FundTransferContext);

    if (!context) {
        throw new Error(
            'useFundTransfer must be used within a FundTransferProvider'
        );
    }
    return context;
};
