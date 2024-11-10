import { CaseType } from '@deps/models/case/case';
import { DocumentType } from '@deps/models/case/document';
import { TaskType } from '@deps/models/case/task';

import { ApiVersion } from './enums';

export const docTypes: {
    [key: string]: DocumentType;
} = {
    [CaseType.Oft]: DocumentType.Oft,
    [CaseType.Renewal]: DocumentType.Exchange,
    [CaseType.Rmd]: DocumentType.Rmd,
    [CaseType.Withdrawal]: DocumentType.Redemption,
    [CaseType.SSW]: DocumentType.SSW,
    [CaseType.Reg60]: DocumentType.Reg60,
    [CaseType.AddressChange]: DocumentType.AddressChange,
    [CaseType.ReReg]: DocumentType.ReReg,
    [CaseType.Suitability]: DocumentType.Suitability,
    [CaseType.SuitabilityReview]: DocumentType.SuitabilityReview,
};

export const caseTypes: {
    [key: string]: CaseType;
} = {
    [DocumentType.Oft]: CaseType.Oft,
    [DocumentType.Exchange]: CaseType.Renewal,
    [DocumentType.Rmd]: CaseType.Rmd,
    [DocumentType.Redemption]: CaseType.Withdrawal,
    [DocumentType.SSW]: CaseType.SSW,
    [DocumentType.Reg60]: CaseType.Reg60,
    [DocumentType.AddressChange]: CaseType.AddressChange,
    [DocumentType.ReReg]: CaseType.ReReg,
};

export const CaseApiVersionMapper: Record<CaseType, ApiVersion> = {
    [CaseType.Oft]: ApiVersion.v2,
    [CaseType.Renewal]: ApiVersion.v1,
    [CaseType.Rmd]: ApiVersion.v1,
    [CaseType.Withdrawal]: ApiVersion.v2,
    [CaseType.Reg60]: ApiVersion.v2,
    [CaseType.SSW]: ApiVersion.v2,
    [CaseType.AddressChange]: ApiVersion.v2,
    [CaseType.ReReg]: ApiVersion.v2,
    [CaseType.Suitability]: ApiVersion.v2,
    [CaseType.SuitabilityReview]: ApiVersion.v2,
};

export const TaskApiVersionMapper: Record<TaskType, ApiVersion> = {
    [TaskType.OFT]: ApiVersion.v2,
    [TaskType.RENEWAL]: ApiVersion.v1,
    [TaskType.RMD]: ApiVersion.v1,
    [TaskType.Withdrawal]: ApiVersion.v2,
    [TaskType.REG60]: ApiVersion.v2,
    [TaskType.SSW]: ApiVersion.v2,
    [TaskType.Suitability]: ApiVersion.v2,
    [TaskType.SuitabilityReview]: ApiVersion.v2,
};
