import { convertKebabedDateString } from "@deps/helpers/string.helper";
import { DisbursementType, Transaction, TransactionStatus } from "@deps/models/policy/sor-policy";
import { DEFAULT_ERROR_STRING } from "@deps/types/constants";

export const calculateProcessedAmount = (transaction: Transaction): number | undefined | null => {
    const { charges, status, transactionAmounts } = transaction;

    const totalCharges = charges
        ? charges.reduce((acc, charge) => {
                const amount = charge.chargeAmount;
                return acc + (typeof amount === 'number' ? amount : 0);
            }, 0)
        : 0;

    if (status === TransactionStatus.Pending) {
        return null;
    }
    
    if (transactionAmounts?.disbursementType === DisbursementType.GROSS) {
        return transactionAmounts?.requestedAmount;
    } else if (transactionAmounts?.disbursementType === DisbursementType.NET) {
        return transactionAmounts?.requestedAmount || 0 + totalCharges;
    }
};

export const calculateProcessDate = (processDate: string, status?: TransactionStatus) => {
    if (status === TransactionStatus.Pending) {
        return DEFAULT_ERROR_STRING;
    }

    return convertKebabedDateString(processDate);
};
