import { TFunction } from 'next-i18next';

import { CDSCPeriods, Products } from './disclosure-authorization.types';

const stableVoyagePlusPlanCodes = [''];

export const productOptions = (t: TFunction, planCode: string) => {
    const isStableVoyagePlus = stableVoyagePlusPlanCodes.includes(planCode);
    return [
        { label: t('products.stableVoyage'), value: Products.stableVoyage },
        { label: t('products.retireEase'), value: Products.retireEase },
        { label: t('products.retireEaseChoice'), value: Products.retireEaseChoice },
        isStableVoyagePlus && { label: t('products.stableVoyagePlus'), value: Products.stableVoyagePlus },
    ].filter(Boolean);
};

export const cdscPeriodOptions = (t: TFunction, planCode: string) => {
    const isStableVoyagePlus = stableVoyagePlusPlanCodes.includes(planCode);
    return [
        !isStableVoyagePlus && { label: t('cdscPeriods.oneYearGuarantee'), value: CDSCPeriods['1YearGuarantee'] },
        { label: t('cdscPeriods.threeYearGuarantee'), value: CDSCPeriods['3YearGuarantee'] },
        !isStableVoyagePlus && { label: t('cdscPeriods.fourYearGuarantee'), value: CDSCPeriods['4YearGuarantee'] },
        { label: t('cdscPeriods.fiveYearGuarantee'), value: CDSCPeriods['5YearGuarantee'] },
        { label: t('cdscPeriods.sevenYearGuarantee'), value: CDSCPeriods['7YearGuarantee'] },
        !isStableVoyagePlus && { label: t('cdscPeriods.nineYearGuarantee'), value: CDSCPeriods['9YearGuarantee'] },
    ].filter(Boolean);
};
