import {
    checkEligibilityLoanRepaymentOneTime,
    checkEligibilityNewLoan,
    checkEligibilityOneTimePremium,
    checkEligibilityPartialWithdrawalOneTime,
    checkEligibilitySystematicPrograms,
    checkEligibilitySystematicProgram,
    SystematicProgramRequestQuery,
    checkEligibilityFullSurrender,
    checkEligibilityManageRole,
    checkEligibilityManageBankChange,
    checkEligibilityFreelookCancellation,
} from '@deps/queries/api/bpm';
import {
    checkEligibilityAddressChange,
    checkEligibilityBeneficiary,
    checkEligibilityCommunicationPreferenceChange,
    checkEligibilityEmailChange,
    checkEligibilityPhoneChange,
} from '@deps/queries/api/bpm-non-financial';
import { initialDeathClaimExists } from '@deps/queries/api/web-non-financial';

export const checkOneTimePremiumEligibilityQuery = async (
    planCode: string,
    policyNumber: string
) => {
    return await checkEligibilityOneTimePremium(planCode, policyNumber);
};

export const checkSystematicProgramsEligibilityQuery = async (
    planCode: string,
    policyNumber: string,
    arrangementId: string
) => {
    return await checkEligibilitySystematicPrograms(
        planCode,
        policyNumber,
        arrangementId
    );
};

export const checkLoanRepaymentOneTimeEligibilityQuery = async (
    planCode: string,
    policyNumber: string,
    totalLoanBalance: number | undefined
) => {
    return await checkEligibilityLoanRepaymentOneTime(
        planCode,
        policyNumber,
        totalLoanBalance
    );
};

export const checkNewLoanEligibilityQuery = async (
    planCode: string,
    policyNumber: string,
    maxLoanValue: number | undefined
) => {
    return await checkEligibilityNewLoan(planCode, policyNumber, maxLoanValue);
};

export const checkPartialWithdrawalOneTimeEligibilityQuery = async (
    planCode: string,
    policyNumber: string
) => {
    return await checkEligibilityPartialWithdrawalOneTime(
        planCode,
        policyNumber
    );
};

export const checkBeneficiaryEligibilityQuery = async (
    planCode: string,
    policyNumber: string
) => {
    return await checkEligibilityBeneficiary(planCode, policyNumber);
};

export const checkPhoneChangeEligibilityQuery = async (
    planCode: string,
    policyNumber: string
) => {
    return await checkEligibilityPhoneChange(planCode, policyNumber);
};

export const checkCommunicationPreferenceChangeEligibilityQuery = async (
    planCode: string,
    policyNumber: string
) => {
    return await checkEligibilityCommunicationPreferenceChange(
        planCode,
        policyNumber
    );
};

export const checkAddressChangeEligibilityQuery = async (
    planCode: string,
    policyNumber: string
) => {
    return await checkEligibilityAddressChange(planCode, policyNumber);
};

export const checkEmailChangeEligibilityQuery = async (
    planCode: string,
    policyNumber: string
) => {
    return await checkEligibilityEmailChange(planCode, policyNumber);
};

export const checkFullSurrenderWithdrawal = async (
    planCode: string,
    policyNumber: string
) => {
    return await checkEligibilityFullSurrender(planCode, policyNumber);
};

export const checkInitialDeathClaimExistsQuery = async (
    policyNumber: string,
    clientId: string
) => {
    return await initialDeathClaimExists(policyNumber, clientId);
};

export const checkSystematicProgramEligibilityQuery = async (
    planCode: string | undefined,
    policyNumber: string | undefined,
    arrangementId: string,
    query: SystematicProgramRequestQuery
) => {
    return await checkEligibilitySystematicProgram(
        planCode,
        policyNumber,
        arrangementId,
        query
    );
};

export const checkManagRoleEligibilityQuery = async (
    planCode: string | undefined,
    policyNumber: string | undefined,
    role: string
) => {
    return await checkEligibilityManageRole(planCode, policyNumber, role);
};

export const checkManageBankChangeEligibilityQuery = async (
    planCode: string | undefined,
    policyNumber: string | undefined
) => {
    return await checkEligibilityManageBankChange(planCode, policyNumber);
};

export const checkFreelookCancellation = async (
    planCode: string,
    policyNumber: string
) => {
    return await checkEligibilityFreelookCancellation(planCode, policyNumber);
};
