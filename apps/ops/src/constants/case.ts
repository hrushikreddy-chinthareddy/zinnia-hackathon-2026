import { CaseType, Processes } from '@deps/models/case/case';

export const NEA_PLAN_CODES = [
    '112',
    '008',
    '009',
    '007',
    '010',
    '012',
    '014',
    '016',
];
export const disableCreateCase = [
    CaseType.Oft,
    CaseType.Rmd,
    CaseType.SSW,
    CaseType.Renewal,
    CaseType.Withdrawal,
] as CaseType[];

export const CaseTypeToProcessesMap: Record<CaseType, Processes> = {
    [CaseType.Oft]: Processes.OutgoingFundTransfer,
    [CaseType.Rmd]: Processes.RequiredMinimumDistribution,
    [CaseType.Withdrawal]: Processes.Withdrawal,
    [CaseType.Reg60]: Processes.NewBusiness,
    [CaseType.Renewal]: Processes.Renewal,
    [CaseType.SSW]: Processes.SSW,
    [CaseType.AddressChange]: Processes.AddressChange,
    [CaseType.ReReg]: Processes.ReReg,
    [CaseType.Suitability]: Processes.Suitability,
    [CaseType.SuitabilityReview]: Processes.SuitabilityReview,
};

export const ProcessesToCaseTypeMap: Partial<Record<Processes, CaseType>> = {
    [Processes.OutgoingFundTransfer]: CaseType.Oft,
    [Processes.RequiredMinimumDistribution]: CaseType.Rmd,
    [Processes.Withdrawal]: CaseType.Withdrawal,
    [Processes.NewBusiness]: CaseType.Reg60,
    [Processes.Renewal]: CaseType.Renewal,
    [Processes.SSW]: CaseType.SSW,
    [Processes.AddressChange]: CaseType.AddressChange,
    [Processes.ReReg]: CaseType.ReReg,
    [Processes.Suitability]: CaseType.Suitability,
    [Processes.SuitabilityReview]: CaseType.SuitabilityReview,
};

export const DocumentsLimit: number = 25;

export enum DetailTypesEnum {
    Escalation = 'ESCALATION',
    Submission = 'SUBMISSION',
    Deescalation = 'DE-ESCALATION',
    SubmittionDetails = 'submissionDetails',
}
