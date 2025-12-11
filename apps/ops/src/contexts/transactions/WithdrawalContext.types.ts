import { PayeesType } from '@deps/components/workflows/payees-step/payees-step';
import { PaymentMethodType } from '@deps/components/workflows/payment-step/types';
import { AmountType } from '@deps/containers/financial-transactions/withdrawal/amount/types';
import { TaxWithholdingInstructions } from '@zinnia/api-types/types/bpm';

type TaxesType = {
    taxWithholdingInstructions: TaxWithholdingInstructions[];
};
export interface Withdrawal
    extends AmountType,
        TaxesType,
        PayeesType,
        PaymentMethodType {
    caseId?: string;
    correlationId?: string;
}
