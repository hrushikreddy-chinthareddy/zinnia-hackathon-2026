import { Dispatch, SetStateAction } from 'react';

import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import { TransactionResponse } from '@deps/queries/api/bpm';
import { TransactionClickProps } from '@deps/types/segment-analytics';
import { Address, PaymentForm, Policy } from '@zinnia/api-types/types/sor';

export type PaymentMethodType = {
    paymentForm?: PaymentForm;
    paymentAccountNumber?: string;
    paymentBankId?: string;
    paymentBranchName?: string;
    paymentAddressId?: string;
    paymentAddress?: Address;
    fboFfc?: string;
    validationResponse?: TransactionResponse;
};

export interface PaymentState extends PaymentMethodType {
    effectiveDate: string;
    payeePartyId?: string;
    paymentAmount: number | string;
    payorPartyId?: string;
    arrangementType?: string;
}

export type PaymentStepSetState = Dispatch<SetStateAction<PaymentState>>;

export interface PaymentStepProps extends TransactionClickProps {
    parentPage: ParentPage;
    policy: Policy;
    setState: PaymentStepSetState;
    state: PaymentState;
    subtitle?: string;
    validateTransaction?: () => Promise<TransactionResponse>;
    transactionName?: string;
}
