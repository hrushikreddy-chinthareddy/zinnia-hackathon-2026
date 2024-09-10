import { TFunction } from 'next-i18next';

import { LabelValue } from '@deps/types/data';

export enum SearchKeys {
    DocumentNumber = 'documentNumber',
    PolicyNumber = 'policyNumber',
};

export const searchByLabels = (t: TFunction): LabelValue<SearchKeys>[] => [
    {
        label: t('caseRenewal.caseCreate.buttons.policyNumber'),
        value: SearchKeys.PolicyNumber,
        placeholder: t('caseRenewal.caseCreate.buttons.policyNumber') as string,
        errorMessage: t('caseRenewal.caseCreate.error.policyNumber') as string,
    },
    {
        label: t('caseRenewal.caseCreate.buttons.documentNumber'),
        value: SearchKeys.DocumentNumber,
        placeholder:  t('caseRenewal.caseCreate.buttons.documentNumber') as string,
        errorMessage: t('caseRenewal.caseCreate.error.documentNumber') as string,
    },
];