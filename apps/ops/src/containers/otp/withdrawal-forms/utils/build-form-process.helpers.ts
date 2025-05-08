import { OtpWithdrawalFormState } from '@deps/contexts/OtpWithdrawalFormContext';
import { TaskType } from '@deps/models/case/task';
import { TaskStatus } from '@deps/models/case/task-instance';
import { AmountType, CaseStatus, FundWithdrawnMethod, ProgramSubType, ProgramType } from '@deps/models/case/withdrawal/case';

export const OtpBuildFormProcess = (status: CaseStatus | TaskStatus, formState: OtpWithdrawalFormState): OtpWithdrawalFormState => {
    let currentFormState = formState;
    switch (formState.initialForm.taskType) {
        case TaskType.Withdrawal:
        case TaskType.OFT:
        case TaskType.SSW:
            currentFormState = WithdrawalBuildUpdate(status, formState);
            break;
        case TaskType.RMD:
            currentFormState = RMDBuildUpdate(status, formState);
            break;

        default:
            currentFormState;
    }

    return currentFormState;
};

export const WithdrawalBuildUpdate = (status: CaseStatus | TaskStatus, formState: OtpWithdrawalFormState): OtpWithdrawalFormState => {
    const amountDetails = { ...formState.formProgram };
    if (amountDetails?.programType?.text === ProgramType.Withdrawal && amountDetails?.partialAmount?.text) {
        amountDetails.programSubType = { text: formState.fundWithdrawnMethod as FundWithdrawnMethod };
    }

    const distributionInstruction = { ...formState.formDistribution };

    if (status === CaseStatus.Submit || status === TaskStatus.Completed) {
        if (formState.fundWithdrawnMethod === FundWithdrawnMethod.SpecifyFunds) {
            distributionInstruction.funds = distributionInstruction.funds.filter(fund => !!fund.amount.text);
        } else {
            distributionInstruction.funds = [];
        }
    }

    const updatedDisbursement = { ...formState.formDisbursement };

    // Remove the reEnterAccountNumber, reEnterBankRoutingNumber fields
    // TODO: These 2 fields are UI only. need to find a way to separate these fields from formContext
    if (updatedDisbursement.bank && updatedDisbursement.bank.length > 0) {
        delete updatedDisbursement.bank[0].reEnterAccountNumber;
        delete updatedDisbursement.bank[0].reEnterBankRoutingNumber;
    }

    return { ...formState, formDisbursement: updatedDisbursement, formDistribution: distributionInstruction, formProgram: amountDetails };
};

export const RMDBuildUpdate = (status: CaseStatus | TaskStatus, formState: OtpWithdrawalFormState): OtpWithdrawalFormState => {
    const amountDetails = { ...formState.formProgram };
    const distributionInstruction = { ...formState.formDistribution };
    const funds = distributionInstruction.funds.filter(fund => !!fund.amount.text);

    if (formState.fundWithdrawnMethod) {
        amountDetails.programSubType = {
            text: formState.fundWithdrawnMethod,
        };
    }

    if (status === CaseStatus.Submit || [TaskStatus.New, TaskStatus.InProgress, TaskStatus.Completed].includes(status as TaskStatus)) {
        if (formState.fundWithdrawnMethod === FundWithdrawnMethod.SpecifyFunds) {
            distributionInstruction.funds = funds;

            const programSubType =
                funds?.[0]?.amount?.amountType === AmountType.Percent ? ProgramSubType.Percentage : ProgramSubType.Dollar; // CMW-13427

            amountDetails.programSubType = { text: funds.length > 0 ? programSubType : ProgramSubType.Prorata }; // CMW-13800 set programSubType default prorata in case of selected specify funds & funds not added
        } else {
            distributionInstruction.funds = [];
            amountDetails.programSubType = { text: ProgramSubType.Prorata }; //CMW-14426 setting default to Prorata
        }
    }
    return { ...formState, formDistribution: distributionInstruction, formProgram: amountDetails };
};