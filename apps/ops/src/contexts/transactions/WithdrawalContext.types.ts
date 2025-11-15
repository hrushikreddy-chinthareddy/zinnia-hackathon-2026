import { TaxWithholdingInstructions } from '@xd/api-types/dist/generated-types/bpm';

import { PayeesType } from '@deps/components/workflows/payees-step/payees-step';
import { PaymentMethodType } from '@deps/components/workflows/payment-step/types';
import { AmountType } from '@deps/containers/financial-transactions/withdrawal/amount/types';

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
