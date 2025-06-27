import { AllocationOption } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';
import { v4 as uuidV4 } from 'uuid';

import { FundTransfer } from '@deps/contexts/transactions/FundTransferContext';
import { FundTransferRequest } from '@deps/queries/api/fund-transfer';
import {
    NUMERIC_DATE_FORMAT,
    ZAHARA_API_DATE_FORMAT,
} from '@deps/types/constants';

export const buildfundTransferRequestBody = (
    fundTransfer: FundTransfer
): FundTransferRequest => {
    const {
        funds,
        caseId,
        effectiveDate,
        reverseInitiator,
        transactionAmounts,
    } = fundTransfer;

    return {
        caseId,
        correlationId: uuidV4(),
        effectiveDate: dayjs(effectiveDate, NUMERIC_DATE_FORMAT).format(
            ZAHARA_API_DATE_FORMAT
        ),
        reverseInitiator,
        transactionAmounts,
        fundAllocation: {
            allocationOption: AllocationOption.SPECIFIEDFUNDS,
        },
        funds: {
            ...funds,
            transferFrom: funds.transferFrom
                .filter(
                    ({ fundId, requestedAmount }) =>
                        fundId && Number(requestedAmount)
                )
                .map(({ fundName, requestedAmount, ...rest }) => ({
                    ...rest,
                    requestedAmount: Number(requestedAmount),
                    fundSegments: [],
                })),
            transferTo: funds.transferTo
                .filter(
                    ({ fundId, requestedAmount }) =>
                        fundId && Number(requestedAmount)
                )
                .map(({ fundName, requestedAmount, ...rest }) => ({
                    ...rest,
                    requestedAmount: Number(requestedAmount),
                    fundSegments: [],
                })),
        },
    };
};
