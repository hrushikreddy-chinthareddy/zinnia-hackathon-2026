import { CaseType, Processes } from '@deps/models/case/case';

export const NEA_PLAN_CODES = ['112', '008', '009', '007', '010', '012', '014', '016'];

export const CaseTypeToProcessesMap: Record<CaseType, Processes> = {
    [CaseType.Oft]: Processes.OutgoingFundTransfer,
    [CaseType.Rmd]: Processes.RequiredMinimumDistribution,
    [CaseType.Withdrawal]: Processes.Withdrawal,
    [CaseType.Reg60]: Processes.NewBusiness,
    [CaseType.Renewal]: Processes.Renewal,
    [CaseType.SSW]: Processes.SSW,
    [CaseType.AddressChange]: Processes.AddressChange,
    [CaseType.ReReg]: Processes.ReReg,
};
