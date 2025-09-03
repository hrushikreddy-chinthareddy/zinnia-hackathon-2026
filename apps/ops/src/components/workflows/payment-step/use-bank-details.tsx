import { useQuery } from '@tanstack/react-query';
import { ArrangementType } from '@xd/api-types/dist/generated-types/sor';
import { Policy, Status } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';

import { isEndDated } from '@deps/helpers/date.helpers';
import { QueryKeys } from '@deps/pages/cases/caseFilterQueryStore';
import { getPaymentMethods } from '@deps/queries/api/aggregation';

import { PaymentState } from './types';

export const usePaymentMethods = ({
    state,
    policy,
}: {
    state: PaymentState;
    policy: Policy;
}) => {
    const { policyNumber, product, systematicPrograms } = policy;

    const {
        payeePartyId,
        payorPartyId,
        arrangementType = ArrangementType.PAYMENT,
    } = state;

    const payPartyId = payeePartyId || payorPartyId;
    const paymentProgram = systematicPrograms?.find(
        (program) =>
            program.arrangementType === arrangementType &&
            program.status === Status.ACTIVE
    );

    const programBankId = paymentProgram?.party?.find(
        (party) => party.partyId === payPartyId
    );

    const {
        data = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: [
            QueryKeys.bankDetails,
            payPartyId,
            product?.planCode,
            policyNumber,
        ],
        queryFn: () =>
            getPaymentMethods({
                partyId: payPartyId || '',
                planCode: product?.planCode || '',
                policyNumber: policyNumber || '',
            }),
        enabled:
            !!payPartyId?.length &&
            !!product?.planCode?.length &&
            !!policyNumber?.length,
        select: (data) => {
            if (!Array.isArray(data)) throw new Error('data is not an array');
            const currentBankDetails = data?.filter((bank: any) => {
                return !isEndDated(bank?.endDate);
            });
            return currentBankDetails?.sort((a, b) => {
                if (a.bankId === programBankId) return -1;
                if (b.bankId === programBankId) return 1;

                if (dayjs(b.startDate).isSame(a.startDate)) {
                    return a.bankId?.localeCompare(b.bankId || '') || 1;
                }

                return dayjs(b.startDate).isBefore(a.startDate) ? 1 : -1;
            });
        },
    });

    return {
        data,
        isLoading,
        isError,
    };
};
