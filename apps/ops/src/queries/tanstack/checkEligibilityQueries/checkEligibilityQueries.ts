import { checkEligibilityLoanRepaymentOneTime, checkEligibilityNewLoan, checkEligibilityOneTimePremium, checkEligibilityPartialWithdrawalOneTime, checkEligibilitySystematicPrograms } from "@deps/queries/api/bpm";

export const checkOneTimePremiumEligibilityQuery = async (planCode: string, policyNumber: string) => {
    return await checkEligibilityOneTimePremium(planCode, policyNumber);
};

export const checkSystematicProgramsEligibilityQuery = async (planCode: string, policyNumber: string, arrangementId: string) => {
    return await checkEligibilitySystematicPrograms(planCode, policyNumber, arrangementId);
};

export const checkLoanRepaymentOneTimeEligibilityQuery = async (planCode: string, policyNumber: string, totalLoanBalance: number | undefined) => {
    return await checkEligibilityLoanRepaymentOneTime(planCode, policyNumber, totalLoanBalance);
};

export const checkNewLoanEligibilityQuery = async (planCode: string, policyNumber: string, maxLoanValue: number | undefined) => {
    return await checkEligibilityNewLoan(planCode, policyNumber, maxLoanValue);
};

export const checkPartialWithdrawalOneTimeEligibilityQuery = async (planCode: string, policyNumber: string) => {
    return await checkEligibilityPartialWithdrawalOneTime(planCode, policyNumber);
}
