import { TFunction } from "next-i18next";

import { PolicyDetails } from "@deps/helpers/policy-sor/PolicyDetails";
import { convertKebabedDateString } from "@deps/helpers/string.helper";
import { AccountType, Policy, Transaction, TransactionStatus } from "@deps/models/policy/sor-policy";
import { getLoanInterestRate } from "@deps/queries/api/product-rate";

import { calculateProcessDate, calculateProcessedAmount } from "./side-sheet-new-loan-transaction.helper";
import { NewLoanTransactionSideSheetValues } from "./types";
import { PayeePaymentDetails } from "../types";

// TODO MG: consolidate with withdrawals getPayeePaymentDetails
const getLoanPayeePaymentDetails = (policy: Policy, transaction: Transaction): PayeePaymentDetails[] => {
    const results: PayeePaymentDetails[] = [];

    const { payeeOrBeneficiaries, transactionAmounts, status } = transaction;

    const partyIds = payeeOrBeneficiaries?.map(item => item.partyId).filter(id => id !== undefined) || [];
    const bankIds = payeeOrBeneficiaries?.map(item => item.bankId).filter(id => id !== undefined) || [];

    partyIds.forEach(partyId => {
        const party = policy.parties?.find(party => party.partyId === partyId);
        if (party) {
            const bankDetails = party.bankDetails?.find(bank => bankIds.includes(bank.bankId as string));
            const payee = payeeOrBeneficiaries?.filter(party => party.partyId === partyId)[0];

            results.push({
                allocationPercentage: payee?.allocationPercentage,
                bankDetails: {
                    branchName: bankDetails?.branchName || '',
                    nameOnAccount: bankDetails?.nameOnAccount as string,
                    accountNumber: bankDetails?.accountNumber as string,
                    accountType: bankDetails?.accountType as AccountType,
                },
                disbursementAmount: status === TransactionStatus.Pending ? transactionAmounts?.requestedAmount : payee?.disbursementAmount,
                partyId: party.partyId as string,
            });
        }
    });

    return results;
};

export const getNewLoanSideSheetValues = (policy: Policy, transaction: Transaction, t: TFunction): NewLoanTransactionSideSheetValues => {
    const { effectiveDate, processDate, status, transactionAmounts } = transaction;
    const { requestedAmount, loanInterestType } = transactionAmounts ?? {};

    const payeePaymentDetails = getLoanPayeePaymentDetails(policy, transaction);

    return {
        effectiveDate: convertKebabedDateString(effectiveDate),
        fundDisbursementType: t('policy.history.newLoanSideSheet.proRata') as string,
        getAsyncSideSheetValues: async () => {
            const interestRate = await getLoanInterestRate(
                new PolicyDetails(policy), policy?.policyDates?.issueDate
            );

            return {
                interestRate: interestRate as number,
            };
        },
        loanAmount: requestedAmount,
        loanInterestType: loanInterestType,
        payeePaymentDetails,
        processDate: calculateProcessDate(processDate as string, status),
        processedAmount: calculateProcessedAmount(transaction),
        status,
    };
};
