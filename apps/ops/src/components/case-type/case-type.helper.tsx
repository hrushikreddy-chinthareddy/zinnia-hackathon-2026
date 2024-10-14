import { Processes } from '@deps/models/case/case';

export const getCaseTypeText = (caseType: string, t: any): string => {
    switch (caseType) {
        case Processes.Correspondence:
            return t('caseType.correspondence') as string;

        case 'NB':
        case Processes.NewBusiness:
            return t('caseType.newBusiness') as string;

        case Processes.Redemption:
            return t('caseType.redemption') as string;

        case Processes.Renewal:
            return t('caseType.renewal') as string;

        case Processes.Withdrawal:
            return t('caseType.withdrawal') as string;

        default:
            return caseType;
    }
};
